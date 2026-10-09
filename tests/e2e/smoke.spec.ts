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
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
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
