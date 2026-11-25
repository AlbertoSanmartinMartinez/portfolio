import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const mailpit = process.env.MAILPIT_URL ?? "";

async function fill(page: Page, values: { name?: string; email?: string; message?: string }) {
  if (values.name !== undefined) await page.getByLabel("Name").fill(values.name);
  if (values.email !== undefined) await page.getByLabel("Email", { exact: true }).fill(values.email);
  if (values.message !== undefined) await page.getByLabel("Message").fill(values.message);
}

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en#contact");
  });

  test("AC-1: a valid message is sent, emailed and the form is cleared", async ({ page, request }) => {
    test.skip(!mailpit, "needs MAILPIT_URL from scripts/stack.sh info");
    await request.delete(`${mailpit}/api/v1/messages`);
    await fill(page, { name: "Ada E2E", email: "ada.e2e@example.test", message: "Hello from the end-to-end tests." });
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("status")).toHaveText("Thanks, I'll get back to you soon.");
    await expect(page.getByLabel("Name")).toHaveValue("");
    await expect.poll(async () => (await (await request.get(`${mailpit}/api/v1/messages`)).json()).messages_count).toBe(1);
  });

  test("AC-2 and AC-8: errors next to each field, linked and accessible", async ({ page }) => {
    await fill(page, { email: "nope", message: "short" });
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Name")).toBeFocused();
    await expect(page.locator("#contact-name-error")).toHaveText("This field is required.");
    await expect(page.locator("#contact-email-error")).toHaveText("Enter a valid email address.");
    await expect(page.locator("#contact-message-error")).toHaveText("Tell me a bit more (at least 10 characters).");
    await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute("aria-describedby", "contact-email-error");
    const results = await new AxeBuilder({ page }).include("#contact").analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test("AC-4: too many messages shows when to try again", async ({ page }) => {
    await page.route("**/api/v1/contact", (route) =>
      route.fulfill({ status: 429, headers: { "retry-after": "3600" }, json: { error: "rate_limited" } }),
    );
    await fill(page, { name: "Ada", email: "ada@example.test", message: "Hello, this is long enough." });
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("status")).toHaveText("You've sent several messages in a row. Please try again in an hour.");
  });

  test("AC-6: the button is disabled while sending and a failure keeps the text", async ({ page }) => {
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/api/v1/contact", async (route) => {
      await held;
      await route.fulfill({ status: 500, json: { error: "internal" } });
    });
    await fill(page, { name: "Ada", email: "ada@example.test", message: "Hello, this is long enough." });
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("button", { name: "Sending…" })).toBeDisabled();
    release();
    await expect(page.getByRole("status")).toHaveText("It couldn't be sent. Please try again.");
    await expect(page.getByLabel("Message")).toHaveValue("Hello, this is long enough.");
  });
});

test("AC-9: the privacy notice links to the privacy page in each language", async ({ page }) => {
  for (const [home, link, path, title] of [
    ["/en", "privacy policy", "/en/privacy", "Privacy policy"],
    ["/es", "política de privacidad", "/es/privacidad", "Política de privacidad"],
  ]) {
    await page.goto(home);
    await page.getByRole("link", { name: link }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  }
  expect((await page.goto("/en/privacidad"))?.status()).toBe(404);
});
