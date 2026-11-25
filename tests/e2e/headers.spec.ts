import { expect, test } from "@playwright/test";

test("AC-7 (003): security and version headers on pages and the API", async ({ request }) => {
  for (const path of ["/en", "/es/privacidad"]) {
    const response = await request.get(path);
    const headers = response.headers();
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-app-version"]).toBeTruthy();
  }
});
