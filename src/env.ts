import { z } from "zod";

/** Variables the site needs at build time. `.env.example` lists every key (tests/unit/env.test.ts). */
export const envSchema = z.object({
  SITE_URL: z.url(),
});

/** Variables the API needs at runtime (docs/guides/config-secrets.md). SMTP_USER and SMTP_PASSWORD are secrets. */
export const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.email(),
  MAIL_TO: z.email(),
});

function parse<T extends z.ZodType>(schema: T, source: Record<string, string | undefined>): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid or missing environment variables: ${names}. See .env.example.`);
  }
  return result.data;
}

export const readEnv = (source: Record<string, string | undefined> = process.env) => parse(envSchema, source);
export const readServerEnv = (source: Record<string, string | undefined> = process.env) => parse(serverEnvSchema, source);
