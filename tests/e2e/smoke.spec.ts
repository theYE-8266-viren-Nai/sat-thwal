import { expect, test } from "@playwright/test";

const protectedRoutes = [
  "/",
  "/home",
  "/explore",
  "/tutors",
  "/hostels",
  "/food",
  "/transportation",
  "/smartmatch",
  "/saved",
  "/profile",
  "/onboarding",
  "/onboarding/verify-id",
  "/admin/dashboard",
  "/admin/audit-trail",
  "/admin/provider-registrations",
  "/driver/dashboard",
  "/driver/routes",
  "/driver/registrations",
  "/driver/notifications",
  "/driver/profile",
  "/restaurant/dashboard",
];

test.describe("public auth pages", () => {
  test("renders login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("[data-slot='card-title']", { hasText: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await expect(page.getByText("official UIT student services")).toBeVisible();
  });

  test("renders signup page", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.locator("[data-slot='card-title']", { hasText: "Create your account" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });
});

test.describe("anonymous route guards", () => {
  for (const route of protectedRoutes) {
    test(`redirects ${route} to login`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login$/);
      await expect(page.locator("[data-slot='card-title']", { hasText: "Welcome back" })).toBeVisible();
    });
  }
});

test.describe("unauthenticated API behavior", () => {
  test("smartmatch returns JSON 401 without a session", async ({ request }) => {
    const response = await request.post("/api/smartmatch", {
      data: { query: "Find a school-approved tutor" },
    });

    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  test("student ID verification validates request shape before auth", async ({ request }) => {
    const response = await request.post("/api/verify-student-id", {
      data: {},
    });

    expect(response.status()).toBe(400);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toEqual({
      error: "Missing uploaded photo path.",
    });
  });

  test("admin audit export redirects anonymous users to login", async ({ request }) => {
    const response = await request.get("/api/admin/audit-trail/export", {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toContain("/login");
  });
});
