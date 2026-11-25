import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { envSchema, readEnv } from "@/env";

describe("environment", () => {
  it("lists every variable of the schema in .env.example", () => {
    const example = readFileSync(".env.example", "utf8");
    const listed = new Set([...example.matchAll(/^([A-Z0-9_]+)=/gm)].map((m) => m[1]));
    for (const key of Object.keys(envSchema.shape)) expect(listed).toContain(key);
  });

  it("refuses missing or invalid values", () => {
    expect(() => readEnv({})).toThrow("SITE_URL");
    expect(() => readEnv({ SITE_URL: "not a url" })).toThrow("SITE_URL");
    expect(readEnv({ SITE_URL: "https://example.test" }).SITE_URL).toBe("https://example.test");
  });
});
