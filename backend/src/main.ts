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
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>("CORS_ORIGIN")?.split(",") || true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get<number>("PORT") || 4000;
  await app.listen(port);
}

void bootstrap();
