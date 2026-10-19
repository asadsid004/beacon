import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { Pool } from "pg";
import { z } from "zod";

const pool = new Pool({ connectionString: process.env.FIXTURE_DATABASE_URL });
const manifestSchema = z.object({ posts: z.record(z.string(), z.uuid()) });
const fixtures = async () =>
  manifestSchema.parse(
    JSON.parse(await readFile(".fixtures/manifest.json", "utf-8"))
  );

const reviewState = async (page: Page, state: string, width: number) => {
  await page.setViewportSize({ width, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBeTruthy();
  await page.screenshot({
    path: `.fixtures/route-${state}-${width}.png`,
    fullPage: true,
  });
};

test.afterAll(async () => {
  await pool.end();
});

test("tag loading keeps the navbar usable until the database read completes", async ({
  page,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE posts IN ACCESS EXCLUSIVE MODE");
    await page.goto("/tags", { waitUntil: "commit" });
    await expect(
      page.getByRole("status").filter({ hasText: "Loading tags" })
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" })
    ).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Beacon home" })).toBeVisible();
    await reviewState(page, "loading", 375);
    await reviewState(page, "loading", 1280);
    await reviewState(page, "loading", 1366);
    await reviewState(page, "loading", 1440);
    await reviewState(page, "loading", 1512);
    await client.query("ROLLBACK");
    await expect(page.locator('main a[href^="/t/"]').first()).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: "Loading tags" })
    ).toHaveCount(0);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
});

test("post content renders while comments are loading and retry recovers a failed read", async ({
  page,
}) => {
  const { posts } = await fixtures();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE comments IN ACCESS EXCLUSIVE MODE");
    await page.goto(`/p/${posts["thread-post"]}`, { waitUntil: "commit" });
    await expect(
      page.getByRole("heading", { name: "thread-post", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: "Loading comments" })
    ).toBeVisible();
    let queryPid: number | undefined;
    await expect
      .poll(async () => {
        const { rows } = await pool.query<{ pid: number }>(
          "SELECT pid FROM pg_stat_activity WHERE application_name = 'beacon-playwright' AND datname = current_database() AND wait_event_type = 'Lock' AND query LIKE '%from \"comments\"%' AND query NOT LIKE '%pg_stat_activity%'"
        );
        queryPid = rows[0]?.pid;
        return queryPid;
      })
      .toBeDefined();
    if (!queryPid) {
      throw new Error("Expected a blocked test-server comment read.");
    }
    await pool.query("SELECT pg_cancel_backend($1)", [queryPid]);
    await expect(
      page.getByRole("heading", { name: "Unable to load this page" })
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" })
    ).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "Browse posts", exact: true })
    ).toBeVisible();
    await reviewState(page, "error", 375);
    await reviewState(page, "error", 1280);
    await reviewState(page, "error", 1366);
    await reviewState(page, "error", 1440);
    await reviewState(page, "error", 1512);
    await client.query("ROLLBACK");
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "thread-post", exact: true })
    ).toBeVisible();
    await expect(page.locator('article[id^="comment-"]')).toHaveCount(21);
    await expect(
      page.getByRole("heading", { name: "Unable to load this page" })
    ).toHaveCount(0);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
});
