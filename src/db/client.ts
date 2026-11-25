import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { pgConfig } from "./pg-config";

let db: NodePgDatabase | undefined;

/** One pool per process, created on first use. */
export function getDb(url: string, ca?: string): NodePgDatabase {
  db ??= drizzle(new Pool(pgConfig(url, ca)));
  return db;
}
