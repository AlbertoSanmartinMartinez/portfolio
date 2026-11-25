import { describe, expect, it } from "vitest";
import { createMemoryRateLimiter } from "@/contact/rate-limit";
import { submitContact, type ContactStore, type Logger, type Mailer, type Ports, type StoredMessage } from "@/contact/service";
import type { ContactInput } from "@/contact/rules";

const valid = { name: "Ada Example", email: "ada@example.test", message: "Hello, I have a project for you.", locale: "en" };
const now = new Date("2026-11-25T10:00:00Z");

function fakes({ mailFails = false } = {}) {
  const rows: (ContactInput & { id: string })[] = [];
  const sent: StoredMessage[] = [];
  const lines: string[] = [];
  const deletedBefore: Date[] = [];
  const store: ContactStore = {
    async insert(message) {
      const id = `id-${rows.length + 1}`;
      rows.push({ ...message, id });
      return { id };
    },
    async deleteOlderThan(date) {
      deletedBefore.push(date);
      return 0;
    },
  };
  const mailer: Mailer = {
    async send(message) {
      if (mailFails) throw Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
      sent.push(message);
    },
  };
  const log: Logger = {
    info: (event, data) => lines.push(JSON.stringify({ event, ...data })),
    error: (event, data) => lines.push(JSON.stringify({ event, ...data })),
  };
  const ports: Ports = { store, mailer, limiter: createMemoryRateLimiter(), log, now: () => new Date(now) };
  return { ports, rows, sent, lines, deletedBefore };
}

describe("submitContact", () => {
  it("stores the message and mails it to Alberto (AC-1)", async () => {
    const f = fakes();
    const result = await submitContact(valid, "1.2.3.4", f.ports);
    expect(result).toEqual({ status: 201, id: "id-1" });
    expect(f.rows).toHaveLength(1);
    expect(f.sent).toEqual([{ ...valid, id: "id-1" }]);
  });

  it("rejects invalid fields without storing (AC-2)", async () => {
    const f = fakes();
    expect(await submitContact({ ...valid, email: "nope" }, "1.2.3.4", f.ports)).toEqual({
      status: 400,
      fields: { email: "invalid_email" },
    });
    expect(f.rows).toHaveLength(0);
  });

  it("answers spam like success but stores and sends nothing (AC-3)", async () => {
    const f = fakes();
    const result = await submitContact({ ...valid, website: "http://spam.example" }, "1.2.3.4", f.ports);
    expect(result.status).toBe(201);
    expect(f.rows).toHaveLength(0);
    expect(f.sent).toHaveLength(0);
  });

  it("limits each address to five messages an hour (AC-4)", async () => {
    const f = fakes();
    for (let i = 0; i < 5; i++) expect((await submitContact(valid, "1.2.3.4", f.ports)).status).toBe(201);
    expect(await submitContact(valid, "1.2.3.4", f.ports)).toEqual({ status: 429, retryAfter: 3600 });
    expect(f.rows).toHaveLength(5);
  });

  it("keeps the message when mail fails, and says so in the logs (AC-5)", async () => {
    const f = fakes({ mailFails: true });
    expect(await submitContact(valid, "1.2.3.4", f.ports)).toEqual({ status: 201, id: "id-1" });
    expect(f.rows).toHaveLength(1);
    expect(f.lines.some((l) => l.includes("contact.mail_failed") && l.includes("ECONNREFUSED"))).toBe(true);
  });

  it("deletes messages older than 12 months when storing (AC-7)", async () => {
    const f = fakes();
    await submitContact(valid, "1.2.3.4", f.ports);
    expect(f.deletedBefore).toEqual([new Date("2025-11-25T10:00:00Z")]);
  });

  it("never logs names, emails, messages or IP addresses (AC-10)", async () => {
    const f = fakes({ mailFails: true });
    await submitContact(valid, "203.0.113.7", f.ports);
    await submitContact({ ...valid, email: "bad" }, "203.0.113.7", f.ports);
    await submitContact({ ...valid, website: "x" }, "203.0.113.7", f.ports);
    const all = f.lines.join("\n");
    for (const secret of [valid.name, valid.email, valid.message, "203.0.113.7", "bad"]) expect(all).not.toContain(secret);
  });
});
