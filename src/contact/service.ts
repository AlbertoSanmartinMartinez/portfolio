import { randomUUID } from "node:crypto";
import type { RateLimiter } from "./rate-limit";
import { isSpam, parseContact, type ContactInput, type FieldErrors } from "./rules";

export type StoredMessage = ContactInput & { id: string };
export type ContactStore = {
  insert(message: ContactInput): Promise<{ id: string }>;
  deleteOlderThan(date: Date): Promise<number>;
};
export type Mailer = { send(message: StoredMessage): Promise<void> };
/** Log fields are ids, counts and codes only: never names, emails, messages or IPs (AC-10). */
export type Logger = {
  info(event: string, data?: Record<string, string | number>): void;
  error(event: string, data?: Record<string, string | number>): void;
};
export type Ports = { store: ContactStore; mailer: Mailer; limiter: RateLimiter; log: Logger; now: () => Date };

export type SubmitResult = { status: 201; id: string } | { status: 400; fields: FieldErrors } | { status: 429; retryAfter: number };

const retentionMonths = 12;

export async function submitContact(body: unknown, ip: string, ports: Ports): Promise<SubmitResult> {
  const { store, mailer, limiter, log, now } = ports;
  if (isSpam(body)) {
    log.info("contact.discarded", { reason: "honeypot" });
    return { status: 201, id: randomUUID() }; // same answer as success (AC-3)
  }
  const parsed = parseContact(body);
  if (!parsed.ok) {
    log.info("contact.rejected", { reason: "validation" });
    return { status: 400, fields: parsed.fields };
  }
  const limit = limiter.hit(ip, now());
  if (!limit.allowed) {
    log.info("contact.rate_limited", { retryAfter: limit.retryAfter });
    return { status: 429, retryAfter: limit.retryAfter };
  }
  const cutoff = now();
  cutoff.setMonth(cutoff.getMonth() - retentionMonths);
  const deleted = await store.deleteOlderThan(cutoff); // AC-7
  const { id } = await store.insert(parsed.value);
  log.info("contact.stored", { id, deleted });
  try {
    await mailer.send({ ...parsed.value, id });
    log.info("contact.mailed", { id });
  } catch (error) {
    const code = (error as { code?: string }).code ?? (error as Error).name ?? "unknown";
    log.error("contact.mail_failed", { id, code }); // stored anyway (AC-5)
  }
  return { status: 201, id };
}
