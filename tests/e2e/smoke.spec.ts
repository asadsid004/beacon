import { expect, test } from "@playwright/test";

test("the production app renders without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Beacon", exact: true })
  ).toBeVisible();
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open Tanstack query devtools" })
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
