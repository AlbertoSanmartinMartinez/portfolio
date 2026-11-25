import { describe, expect, it } from "vitest";
import { createMemoryRateLimiter } from "@/contact/rate-limit";

describe("memory rate limiter (AC-4)", () => {
  it("allows five per hour per key, then says when to retry", () => {
    const limiter = createMemoryRateLimiter();
    const start = new Date("2026-11-25T10:00:00Z");
    for (let i = 0; i < 5; i++) expect(limiter.hit("1.2.3.4", start).allowed).toBe(true);
    const sixth = limiter.hit("1.2.3.4", new Date("2026-11-25T10:10:00Z"));
    expect(sixth).toEqual({ allowed: false, retryAfter: 50 * 60 });
    expect(limiter.hit("5.6.7.8", start).allowed).toBe(true);
    expect(limiter.hit("1.2.3.4", new Date("2026-11-25T11:00:01Z")).allowed).toBe(true);
  });
});
