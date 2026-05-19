import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const envPath = join(__dirname, "..", ".env");
const password = process.env.DB_PASSWORD || "lucianyashA2!";
const encodedPassword = encodeURIComponent(password);
const projectRef = "ldeyzsevnipswtliptay";

const sslQuery = "sslmode=no-verify";

const candidateUrls = [
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?${sslQuery}`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?${sslQuery}`,
  `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres?${sslQuery}`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?${sslQuery}&pgbouncer=true`,
];

async function pickDatabaseUrl(): Promise<string> {
  for (const url of candidateUrls) {
    const client = new Client({
      connectionString: url,
      connectionTimeoutMillis: 12_000,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log(`[setup] Using database: ${url.split("@")[1]}`);
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[setup] Unreachable ${url.split("@")[1]} — ${message.split("\n")[0]}`);
    }
  }
  throw new Error("Could not connect to Supabase Postgres with any known connection string.");
}

function updateEnvDatabaseUrl(url: string) {
  const env = readFileSync(envPath, "utf8");
  const next = env.replace(
    /^DATABASE_URL=.*$/m,
    `DATABASE_URL=${url}`,
  );
  writeFileSync(envPath, next, "utf8");
  console.log("[setup] Updated backend/.env DATABASE_URL");
}

function run(command: string, env: NodeJS.ProcessEnv) {
  console.log(`\n[setup] $ ${command}`);
  execSync(command, {
    cwd: join(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

async function main() {
  const databaseUrl = await pickDatabaseUrl();
  updateEnvDatabaseUrl(databaseUrl);

  const env = { DATABASE_URL: databaseUrl };
  run("npx prisma migrate deploy", env);
  run("npx prisma db seed", env);
  console.log("\n[setup] Database ready. Start the API with: npm run start:dev");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
