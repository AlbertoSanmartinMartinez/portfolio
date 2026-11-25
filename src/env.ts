import { z } from "zod";

/** Every variable the app reads. `.env.example` must list each key (tests/unit/env.test.ts). */
export const envSchema = z.object({
  SITE_URL: z.url(),
});

export function readEnv(source: Record<string, string | undefined> = process.env) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid or missing environment variables: ${names}. See .env.example.`);
  }
  return result.data;
}
