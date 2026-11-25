import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let db: NodePgDatabase | undefined;

/** One pool per process, created on first use. */
export function getDb(url: string): NodePgDatabase {
  db ??= drizzle(new Pool({ connectionString: url, max: 5 }));
  return db;
}
