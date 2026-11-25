import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { runMigrations } from "@/db/migrate";

// A fresh database on the stack's PostgreSQL proves the migrations apply from zero (specs/003 AC-3).
const admin = new Pool({ connectionString: process.env.DATABASE_URL });
const name = `migrate_test_${Date.now()}`;
const url = (() => {
  const u = new URL(process.env.DATABASE_URL ?? "");
  u.pathname = `/${name}`;
  return u.toString();
})();

afterAll(async () => {
  await admin.query(`drop database if exists ${name} with (force)`);
  await admin.end();
});

describe("runMigrations", () => {
  it("applies every migration to an empty database, and is a no-op the second time", async () => {
    await admin.query(`create database ${name}`);
    await runMigrations(url, "drizzle");
    await runMigrations(url, "drizzle");
    const db = new Pool({ connectionString: url });
    const { rows } = await db.query("select to_regclass('public.contact_message') as table");
    await db.end();
    expect(rows[0].table).toBe("contact_message");
  });
});
