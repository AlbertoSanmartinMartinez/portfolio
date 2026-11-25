// Pre-deploy job (specs/003, AC-3): bundled by esbuild into migrate.mjs inside the image,
// run as `node migrate.mjs` before a new version gets traffic. A failure stops the deploy.
import { runMigrations } from "../src/db/migrate";

const url = process.env.DATABASE_URL;
const log = (level: string, event: string, data: Record<string, string> = {}) =>
  console.log(JSON.stringify({ level, event, ...data, time: new Date().toISOString() }));

if (!url) {
  log("error", "migrate.failed", { code: "missing_database_url" });
  process.exit(1);
}
try {
  await runMigrations(url, process.env.MIGRATIONS_DIR ?? "drizzle", process.env.DATABASE_CA_CERT);
  log("info", "migrate.done");
} catch (error) {
  log("error", "migrate.failed", { code: (error as { code?: string }).code ?? (error as Error).name });
  process.exit(1);
}
