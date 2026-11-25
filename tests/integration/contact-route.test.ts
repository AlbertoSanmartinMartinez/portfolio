import { Pool } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/v1/contact/route";

const site = new URL(process.env.SITE_URL ?? "").origin;
const mailpit = process.env.MAILPIT_URL ?? "";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const valid = {
  name: "Ada Integration",
  email: "ada.integration@example.test",
  message: "Hello from the integration tests.",
  locale: "en",
};
let ipCounter = 0;

function post(body: unknown, { origin = site, ip = `198.51.100.${++ipCounter}` } = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return POST(
    new Request(`${site}/api/v1/contact`, {
      method: "POST",
      headers: { "content-type": "application/json", origin, "x-forwarded-for": ip },
      body: raw,
    }),
  );
}
const count = async () => Number((await pool.query("select count(*) from contact_message")).rows[0].count);
const mails = async () => (await (await fetch(`${mailpit}/api/v1/messages`)).json()).messages as Array<Record<string, unknown>>;

beforeEach(async () => {
  await pool.query("delete from contact_message");
  await fetch(`${mailpit}/api/v1/messages`, { method: "DELETE" });
});
afterAll(() => pool.end());

describe("POST /api/v1/contact", () => {
  it("stores the message and mails Alberto with the sender as reply-to (AC-1)", async () => {
    const response = await post(valid);
    expect(response.status).toBe(201);
    const { id } = await response.json();
    const row = (await pool.query("select name, email, locale from contact_message where id = $1", [id])).rows[0];
    expect(row).toEqual({ name: valid.name, email: valid.email, locale: "en" });
    const [mail] = await mails();
    expect((mail.ReplyTo as Array<{ Address: string }>)[0].Address).toBe(valid.email);
    expect((mail.To as Array<{ Address: string }>)[0].Address).toBe(process.env.MAIL_TO);
  });

  it("answers 400 with field codes and stores nothing (AC-2)", async () => {
    const response = await post({ ...valid, email: "nope", message: "short" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "validation", fields: { email: "invalid_email", message: "too_short" } });
    expect(await count()).toBe(0);
  });

  it("drops spam silently (AC-3)", async () => {
    const response = await post({ ...valid, website: "http://spam.example" });
    expect(response.status).toBe(201);
    expect(await count()).toBe(0);
    expect(await mails()).toHaveLength(0);
  });

  it("limits an address to five messages an hour (AC-4)", async () => {
    for (let i = 0; i < 5; i++) expect((await post(valid, { ip: "203.0.113.50" })).status).toBe(201);
    const sixth = await post(valid, { ip: "203.0.113.50" });
    expect(sixth.status).toBe(429);
    expect(Number(sixth.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("deletes messages older than 12 months when a new one arrives (AC-7)", async () => {
    await pool.query(
      "insert into contact_message (name, email, message, locale, created_at) values ('Old', 'old@example.test', 'An old synthetic message.', 'en', now() - interval '13 months')",
    );
    expect((await post(valid)).status).toBe(201);
    expect((await pool.query("select count(*) from contact_message where name = 'Old'")).rows[0].count).toBe("0");
  });

  it("rejects other origins and large bodies without storing (AC-12)", async () => {
    expect((await post(valid, { origin: "https://evil.example" })).status).toBe(403);
    expect((await post({ ...valid, message: "x".repeat(11 * 1024) })).status).toBe(413);
    expect(await count()).toBe(0);
  });
});
