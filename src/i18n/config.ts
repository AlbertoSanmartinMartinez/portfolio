export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeCookie = "lang";

export function hasLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * The locale for a visitor without one in the URL: a saved choice first, then the
 * first supported language in the browser's order of preference (AC-1, AC-3).
 */
export function pickLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (hasLocale(cookie)) return cookie;
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) : 1, index };
    })
    .filter((entry) => entry.base && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return preferred.map((entry) => entry.base).find(hasLocale) ?? defaultLocale;
}
