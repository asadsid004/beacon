import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import { z } from "zod";

const manifestSchema = z.object({ posts: z.record(z.string(), z.uuid()) });
const getFixtures = async () =>
  manifestSchema.parse(
    JSON.parse(await readFile(".fixtures/manifest.json", "utf-8"))
  );

test("title-only opens its detail by keyboard and its comments link after returning to the feed", async ({
  page,
}) => {
  const { posts } = await getFixtures();
  await page.goto("/?sort=new");
  const card = page.locator("article").filter({
    has: page.getByRole("heading", { name: "title-only", exact: true }),
  });
  const title = card.getByRole("link", { name: "title-only", exact: true });
  await title.focus();
  await expect(title).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/p/${posts["title-only"]}$`, "u"));
  await expect(
    page.getByRole("heading", { level: 1, name: "title-only", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Comments", exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("No comments yet.", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/\?sort=new$/u);
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .locator('[aria-current="page"]')
  ).toHaveText("New");
  await card
    .getByRole("link", { name: "Read 0 comments on title-only", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`/p/${posts["title-only"]}$`, "u"));
  await expect(
    page.getByRole("heading", { level: 1, name: "title-only", exact: true })
  ).toBeVisible();
  expect(page.context().pages()).toHaveLength(1);
});

test("feed titles open details and Markdown is rendered without HTML or body images", async ({
  page,
}) => {
  const { posts } = await getFixtures();
  await page.goto("/?sort=new");
  await page.getByRole("link", { name: "text-body", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/p/${posts["text-body"]}$`, "u"));
  await expect(
    page.getByRole("heading", { name: "A readable discussion" })
  ).toBeVisible();
  await expect(page.locator("main strong")).toHaveText("bold text");
  await expect(page.locator("main li")).toHaveText([
    "First point",
    "Second point",
  ]);
  const source = page.getByRole("link", { name: "source", exact: true });
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(source).toHaveAttribute(
    "rel",
    "noopener noreferrer nofollow ugc"
  );
  await expect(page.locator("main img, main script")).toHaveCount(0);
  await expect(page.getByText("alert('hidden')")).toHaveCount(0);
});

test("header images keep their aspect ratio when loading fails", async ({
  page,
}) => {
  const { posts } = await getFixtures();
  await page.route("**/fixtures/header.png", async (route) => {
    await route.fulfill({
      path: "public/fixtures/header.png",
      contentType: "image/png",
    });
  });
  await page.goto(`/p/${posts["header-valid"]}`);
  const image = page.locator("main img");
  await expect(image).toHaveAttribute("fetchpriority", "high");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(image).toHaveAttribute("alt", "");
  await expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
  await expect
    .poll(() =>
      image.evaluate((img) =>
        img instanceof HTMLImageElement ? img.naturalWidth : 0
      )
    )
    .toBeGreaterThanOrEqual(1600);
  const box = await image.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(21 / 9, 2);
  await page.route("**/fixtures/missing.png", async (route) => {
    await route.fulfill({ status: 404 });
  });
  await page.goto(`/p/${posts["header-broken"]}`);
  const fallback = page.getByText("Image unavailable", { exact: true });
  await expect(fallback).toBeVisible();
  const fallbackBox = await fallback.locator("..").boundingBox();
  expect((fallbackBox?.width ?? 0) / (fallbackBox?.height ?? 1)).toBeCloseTo(
    21 / 9,
    2
  );
});

test("published link details retain external link behavior and deleted notices", async ({
  page,
}) => {
  const { posts } = await getFixtures();
  await page.goto(`/p/${posts["link-external"]}`);
  await expect(page.locator("main h1 a")).toHaveAttribute(
    "href",
    "https://example.com/article"
  );
  await expect(page.locator("main h1 a")).toHaveAttribute("target", "_blank");
  await page.goto(`/p/${posts["deleted-thread"]}`);
  await expect(
    page.getByText("This post was deleted by the author.")
  ).toBeVisible();
  await expect(page.getByText("by [deleted]", { exact: true })).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);
  await page.goto(`/p/${posts["draft-private"]}`);
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});

for (const id of ["invalid", "00000000-0000-4000-8000-000000000000"]) {
  test(`unavailable post ${id} shows not-found`, async ({ page }) => {
    await page.goto(`/p/${id}`);
    await expect(
      page.getByRole("heading", { name: "Page not found" })
    ).toBeVisible();
  });
}

test("uncached document navigation renders the malformed post not-found page", async ({
  page,
}) => {
  // Disable the browser HTTP cache without mocking responses.
  await page.route("**/*", (route) => route.continue());
  await page.goto("/?sort=new");
  await expect(page.locator("main article")).toHaveCount(20);
  await page.goto("/t/unknown-fixture-tag");
  await expect(
    page.getByRole("heading", { name: "Page not found", exact: true })
  ).toBeVisible();
  await page.goto("/u/unknown-fixture-user");
  await expect(
    page.getByRole("heading", { name: "Page not found", exact: true })
  ).toBeVisible();
  await page.goto("/p/not-a-uuid");
  await expect(
    page.getByRole("heading", { name: "Page not found", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toHaveCount(1);
  await page.getByRole("link", { name: "Browse posts", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Posts", exact: true })
  ).toBeVisible();
});
