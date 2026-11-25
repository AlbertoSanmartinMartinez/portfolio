import { describe, expect, it } from "vitest";
import { isSpam, parseContact, validateContact } from "@/contact/rules";

const valid = { name: "Ada", email: "ada@example.test", message: "Hello, I have a project.", locale: "en" };

describe("contact rules (AC-2)", () => {
  it("accepts a valid message", () => {
    expect(validateContact(valid)).toEqual({});
  });
  it("reports each invalid field with its code", () => {
    expect(validateContact({ name: " ", email: "nope", message: "short" })).toEqual({
      name: "required",
      email: "invalid_email",
      message: "too_short",
    });
    expect(validateContact({ ...valid, name: "x".repeat(101), message: "y".repeat(5001) })).toEqual({
      name: "too_long",
      message: "too_long",
    });
    expect(validateContact({})).toEqual({ name: "required", email: "required", message: "required" });
  });
  it("normalizes the input: trimmed, single-line name, known locale", () => {
    const parsed = parseContact({ ...valid, name: "  Ada\nLovelace ", locale: "fr" });
    expect(parsed).toEqual({ ok: true, value: { ...valid, name: "Ada Lovelace", locale: "en" } });
  });
  it("detects the honeypot (AC-3)", () => {
    expect(isSpam({ ...valid, website: "http://spam.example" })).toBe(true);
    expect(isSpam({ ...valid, website: "" })).toBe(false);
    expect(isSpam(valid)).toBe(false);
  });
});
