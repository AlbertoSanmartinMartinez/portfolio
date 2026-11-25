import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { envSchema, readEnv, readServerEnv, serverEnvSchema } from "@/env";

describe("environment", () => {
  it("lists every variable of both schemas in .env.example", () => {
    const example = readFileSync(".env.example", "utf8");
    const listed = new Set([...example.matchAll(/^([A-Z0-9_]+)=/gm)].map((m) => m[1]));
    for (const key of [...Object.keys(envSchema.shape), ...Object.keys(serverEnvSchema.shape)]) expect(listed).toContain(key);
  });

  it("refuses missing or invalid values", () => {
    expect(() => readEnv({})).toThrow("SITE_URL");
    expect(() => readEnv({ SITE_URL: "not a url" })).toThrow("SITE_URL");
    expect(readEnv({ SITE_URL: "https://example.test" }).SITE_URL).toBe("https://example.test");
    expect(() => readServerEnv({ SMTP_HOST: "smtp.example.test" })).toThrow("DATABASE_URL");
  });

  it("reads the server variables, with SMTP credentials optional", () => {
    const env = readServerEnv({
      DATABASE_URL: "postgres://u:p@localhost:5432/app",
      SMTP_HOST: "localhost",
      SMTP_PORT: "1025",
      MAIL_FROM: "web@example.test",
      MAIL_TO: "alberto@example.test",
    });
    expect(env.SMTP_PORT).toBe(1025);
    expect(env.SMTP_USER).toBeUndefined();
  });
});
