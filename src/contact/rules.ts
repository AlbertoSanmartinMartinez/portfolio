/** Contact form rules shared by the API and the form (AC-2). Limits match openapi/openapi.yaml. */
export const limits = { nameMax: 100, emailMax: 254, messageMin: 10, messageMax: 5000 } as const;

export type Locale = "es" | "en";
export type FieldErrorCode = "required" | "invalid_email" | "too_short" | "too_long";
export type FieldErrors = Partial<Record<"name" | "email" | "message", FieldErrorCode>>;
export type ContactInput = { name: string; email: string; message: string; locale: Locale };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export function validateContact(input: { name?: unknown; email?: unknown; message?: unknown }): FieldErrors {
  const errors: FieldErrors = {};
  const name = text(input.name);
  const email = text(input.email);
  const message = text(input.message);
  if (!name) errors.name = "required";
  else if (name.length > limits.nameMax) errors.name = "too_long";
  if (!email) errors.email = "required";
  else if (email.length > limits.emailMax || !emailPattern.test(email)) errors.email = "invalid_email";
  if (!message) errors.message = "required";
  else if (message.length < limits.messageMin) errors.message = "too_short";
  else if (message.length > limits.messageMax) errors.message = "too_long";
  return errors;
}

/** Normalizes a request body: trimmed fields, single-line name, known locale. */
export function parseContact(body: unknown): { ok: true; value: ContactInput } | { ok: false; fields: FieldErrors } {
  const data = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const fields = validateContact(data);
  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return {
    ok: true,
    value: {
      name: text(data.name).replace(/\s+/g, " "),
      email: text(data.email),
      message: text(data.message),
      locale: data.locale === "es" ? "es" : "en",
    },
  };
}

/** The hidden field only bots fill in (AC-3). */
export function isSpam(body: unknown): boolean {
  const website = typeof body === "object" && body !== null ? (body as Record<string, unknown>).website : undefined;
  return typeof website === "string" && website.trim() !== "";
}
