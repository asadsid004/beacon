import { expect, test } from "@playwright/test";

test("the production app renders without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Posts", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back" })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Sign up", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/signup$/u);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Beacon", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open Tanstack query devtools" })
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("unmatched routes keep one navbar and a working return link", async ({
  page,
}) => {
  const response = await page.goto("/missing-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toHaveCount(1);
  await page.getByRole("link", { name: "Browse posts" }).click();
  await expect(
    page.getByRole("heading", { name: "Posts", exact: true })
  ).toBeVisible();
});

test("mobile navigation keeps filters and auth controls in separate rows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.locator('[aria-current="page"]')).toHaveText("Hot");
  await expect(
    page.getByRole("navigation", { name: "Sort posts" })
  ).toHaveCount(0);
  const logo = await page
    .getByRole("link", { name: "Beacon home" })
    .boundingBox();
  const login = await page
    .getByRole("link", { name: "Log in", exact: true })
    .boundingBox();
  const signup = await page
    .getByRole("link", { name: "Sign up", exact: true })
    .boundingBox();
  const filters = await navigation.boundingBox();
  expect(logo).not.toBeNull();
  expect(login).not.toBeNull();
  expect(signup).not.toBeNull();
  expect(filters).not.toBeNull();
  if (!(logo && login && signup && filters)) {
    throw new Error("Missing navigation controls");
  }
  expect(logo.x + logo.width).toBeLessThanOrEqual(login.x);
  expect(login.x + login.width).toBeLessThanOrEqual(signup.x);
  expect(login.y + login.height).toBeLessThanOrEqual(filters.y);
  await expect(page.locator("article")).toHaveCount(20);
  await page.evaluate(() => window.scrollTo(0, 400));
  const header = await page.locator("header").boundingBox();
  expect(header?.y).toBe(0);
});
