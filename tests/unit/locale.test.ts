import { describe, expect, it } from "vitest";
import { pickLocale } from "@/i18n/config";

describe("pickLocale (AC-1, AC-3)", () => {
  it("sends Spanish browsers to es", () => {
    expect(pickLocale(undefined, "es-ES,es;q=0.9")).toBe("es");
  });
  it("sends any other language to en", () => {
    expect(pickLocale(undefined, "de-DE,de;q=0.9")).toBe("en");
    expect(pickLocale(undefined, null)).toBe("en");
  });
  it("respects the order of preference", () => {
    expect(pickLocale(undefined, "en;q=0.5,es;q=0.8")).toBe("es");
    expect(pickLocale(undefined, "fr-FR,en;q=0.7,es;q=0.6")).toBe("en");
  });
  it("prefers the saved choice over the browser", () => {
    expect(pickLocale("en", "es-ES")).toBe("en");
    expect(pickLocale("xx", "es-ES")).toBe("es");
  });
});
