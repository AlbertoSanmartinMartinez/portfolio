export type RateLimiter = { hit(key: string, now: Date): { allowed: boolean; retryAfter: number } };

/**
 * Sliding-window limit kept in memory (AC-4). Per instance by design: the IP never
 * leaves the process and is never stored (docs/guides/privacy.md).
 */
export function createMemoryRateLimiter({ limit = 5, windowMs = 60 * 60 * 1000 } = {}): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    hit(key, now) {
      const t = now.getTime();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfter: Math.ceil((recent[0] + windowMs - t) / 1000) };
      }
      recent.push(t);
      hits.set(key, recent);
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (!v.some((x) => t - x < windowMs)) hits.delete(k);
      }
      return { allowed: true, retryAfter: 0 };
    },
  };
}
