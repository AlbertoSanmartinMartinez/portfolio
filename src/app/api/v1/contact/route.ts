import { createMemoryRateLimiter } from "@/contact/rate-limit";
import { jsonLogger } from "@/contact/log";
import { submitContact, type Ports } from "@/contact/service";
import { getDb } from "@/db/client";
import { createContactStore } from "@/db/contact-store";
import { readEnv, readServerEnv } from "@/env";
import { createSmtpMailer } from "@/mail/smtp";

const maxBytes = 10 * 1024;
const limiter = createMemoryRateLimiter();
let ports: Ports | undefined;

function getPorts(): Ports {
  if (!ports) {
    const env = readServerEnv();
    ports = {
      store: createContactStore(getDb(env.DATABASE_URL, env.DATABASE_CA_CERT)),
      mailer: createSmtpMailer({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
        from: env.MAIL_FROM,
        to: env.MAIL_TO,
      }),
      limiter,
      log: jsonLogger,
      now: () => new Date(),
    };
  }
  return ports;
}

const json = (body: unknown, status: number, headers: Record<string, string> = {}) => Response.json(body, { status, headers });

/** POST /api/v1/contact — openapi/openapi.yaml */
export async function POST(request: Request): Promise<Response> {
  if (request.headers.get("origin") !== new URL(readEnv().SITE_URL).origin) {
    jsonLogger.info("contact.rejected", { reason: "origin" });
    return json({ error: "forbidden_origin" }, 403); // AC-12
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  const raw = declared > maxBytes ? "" : await request.text();
  if (declared > maxBytes || Buffer.byteLength(raw) > maxBytes) {
    jsonLogger.info("contact.rejected", { reason: "size" });
    return json({ error: "too_large" }, 413); // AC-12
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "validation", fields: {} }, 400);
  }
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  try {
    const result = await submitContact(body, ip, getPorts());
    if (result.status === 201) return json({ id: result.id }, 201);
    if (result.status === 400) return json({ error: "validation", fields: result.fields }, 400);
    return json({ error: "rate_limited" }, 429, { "Retry-After": String(result.retryAfter) });
  } catch (error) {
    jsonLogger.error("contact.failed", { code: (error as { code?: string }).code ?? (error as Error).name });
    return json({ error: "internal" }, 500);
  }
}
