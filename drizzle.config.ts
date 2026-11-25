import { defineConfig } from "drizzle-kit";

// docs/guides/migrations.md: edit src/db/schema.ts, then `pnpm db:generate --name <slug>`.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});
