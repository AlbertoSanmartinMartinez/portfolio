import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

type Project = { name: string; links?: Record<string, string> };
const projects = (lang: string): Project[] => JSON.parse(readFileSync(`content/${lang}/projects.json`, "utf8"));

test.describe("AC-1: language from the browser", () => {
  for (const [locale, header, expected] of [
    ["es-ES", "es-ES,es;q=0.9", "es"],
    ["de-DE", "de-DE,de;q=0.9", "en"],
  ]) {
    test(`${locale} lands on /${expected}`, async ({ browser }) => {
      const context = await browser.newContext({ locale, extraHTTPHeaders: { "accept-language": header } });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page).toHaveURL(new RegExp(`/${expected}$`));
      await context.close();
    });
  }
});

test("AC-2: sections in order, in the page's language", async ({ page }) => {
  for (const [lang, heading] of [
    ["es", "Experiencia"],
    ["en", "Experience"],
  ]) {
    await page.goto(`/${lang}`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    const ids = await page.locator("main > section").evaluateAll((sections) => sections.map((s) => s.id));
    expect(ids).toEqual(["about", "experience", ...(projects(lang).length ? ["projects"] : []), "contact"]);
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
});

test("AC-3: the switch keeps the section and is remembered", async ({ page }) => {
  await page.goto("/en#contact");
  await page.getByRole("link", { name: "Switch to Spanish" }).click();
  await expect(page).toHaveURL(/\/es#contact$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
});

test("AC-4: newest experience first; current role says Present / Actualidad", async ({ page }) => {
  await page.goto("/en");
  const starts = await page.locator("#experience ol > li time:first-of-type").evaluateAll((t) => t.map((e) => e.getAttribute("datetime")));
  expect(starts).toEqual([...starts].sort().reverse());
  await expect(page.locator("#experience")).toContainText("Present");
  await page.goto("/es");
  await expect(page.locator("#experience")).toContainText("Actualidad");
});

test("AC-6: projects show only the links they have", async ({ page }) => {
  await page.goto("/en");
  for (const project of projects("en")) {
    const card = page.locator("#projects li", { has: page.getByRole("heading", { level: 3, name: project.name }) });
    await expect(card.getByRole("link")).toHaveCount(Object.values(project.links ?? {}).filter(Boolean).length);
  }
});

test("AC-7: unknown paths get a localized 404", async ({ page }) => {
  for (const [path, title, back, home] of [
    ["/en/nothing", "This page doesn't exist.", "Back to home", "/en"],
    ["/es/nada", "Esta página no existe.", "Volver al inicio", "/es"],
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByRole("link", { name: back })).toHaveAttribute("href", home);
  }
});

test.describe("AC-8: small screens", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("no horizontal overflow; the menu works with the keyboard", async ({ page }) => {
    await page.goto("/en");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const button = page.getByRole("button", { name: "Open menu" });
    await expect(page.getByRole("link", { name: "Experience" })).toBeHidden();
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "Experience" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

test("AC-9: keyboard focus is visible and axe finds no violations", async ({ page }) => {
  for (const lang of ["en", "es"]) {
    await page.goto(`/${lang}`);
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
    expect(outline).not.toBe("none");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  }
});

test("AC-10: metadata per language", async ({ page }) => {
  for (const lang of ["en", "es"]) {
    await page.goto(`/${lang}`);
    await expect(page).toHaveTitle(/Alberto Sanmartín Martínez/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`/${lang}/opengraph-image`));
    for (const hreflang of ["es", "en", "x-default"]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveCount(1);
    }
  }
});
