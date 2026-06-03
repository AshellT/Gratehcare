import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

// Load .env before PrismaClient reads DATABASE_URL (must run before Nest bootstraps).
loadEnv({ path: resolve(__dirname, "..", ".env") });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");
  app.use(helmet());

  const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");
  const corsOrigins = new Set<string>(
    [
      config.get<string>("CORS_ORIGIN"),
      config.get<string>("FRONTEND_URL"),
      "https://gratehcare.vercel.app",
      "http://localhost:3000",
    ]
      .flatMap((entry) => (entry ?? "").split(","))
      .map(normalizeOrigin)
      .filter(Boolean),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = normalizeOrigin(origin);
      if (corsOrigins.has(normalized)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Railway injects PORT — do not set PORT=4000 in Railway Variables (causes 502).
  const port =
    process.env.PORT != null && process.env.PORT !== ""
      ? Number(process.env.PORT)
      : process.env.NODE_ENV !== "production"
        ? Number(config.get<number>("PORT")) || 4000
        : NaN;

  if (!Number.isFinite(port) || port <= 0) {
    console.error(
      "PORT is missing or invalid. On Railway, delete any manual PORT variable and redeploy.",
    );
    process.exit(1);
  }

  const http = app.getHttpAdapter().getInstance();
  http.get("/", (_req: unknown, res: { json: (body: unknown) => void }) => {
    res.json({ status: "ok", service: "gratehcare-api" });
  });

  await app.listen(port, "0.0.0.0");

  console.log(`🚀 GRATEHCARE Backend running on port ${port}`);
  console.log(`📡 Environment: ${config.get<string>("NODE_ENV") || "development"}`);
  console.log(`🔗 API: http://0.0.0.0:${port}/api/v1`);
}

void bootstrap().catch((error) => {
  console.error("Failed to start GRATEHCARE backend:", error);
  process.exit(1);
});
