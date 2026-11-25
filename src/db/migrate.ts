import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { pgConfig } from "./pg-config";

/** Applies the pending migrations in `folder` with Drizzle's runtime migrator (one transaction). */
export async function runMigrations(url: string, folder: string, ca?: string): Promise<void> {
  const pool = new Pool(pgConfig(url, ca, 1));
  try {
    await migrate(drizzle(pool), { migrationsFolder: folder });
  } finally {
    await pool.end();
  }
}
