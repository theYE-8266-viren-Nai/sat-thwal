import { expect, test, type Locator } from "@playwright/test";

const guardedServiceRoutes = ["/tutors", "/hostels", "/food", "/transportation", "/saved"];

async function expectTouchTarget(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
}

test.describe("responsive service flow shell", () => {
  for (const route of guardedServiceRoutes) {
    test(`${route} keeps protected navigation stable`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login$/);
      await expect(page.locator("[data-slot='card-title']", { hasText: "Welcome back" })).toBeVisible();
      await expectTouchTarget(page.getByRole("button", { name: "Log in" }));
    });
  }

  test("auth form remains usable across mobile, tablet, and laptop projects", async ({ page }) => {
    await page.goto("/login");

    const card = page.locator("[data-slot='card']").first();
    await expect(card).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    const loginButton = page.getByRole("button", { name: "Log in" });
    await expect(loginButton).toBeVisible();
    await expectTouchTarget(loginButton);
  });
});
