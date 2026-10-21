import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";
import { Pool } from "pg";
import { z } from "zod";

import { FIXTURE_PASSWORD } from "../../src/db/seed/fixtures";

const pool = new Pool({ connectionString: process.env.FIXTURE_DATABASE_URL });
const manifestSchema = z.object({ posts: z.record(z.string(), z.uuid()) });
const fixtures = async () =>
  manifestSchema.parse(
    JSON.parse(await readFile(".fixtures/manifest.json", "utf-8"))
  );

const sessions = new Map<
  string,
  {
    request: APIRequestContext;
    cookies: Awaited<ReturnType<APIRequestContext["storageState"]>>["cookies"];
  }
>();

const restoreSession = async (page: Page, username: string) => {
  const session = sessions.get(username);
  if (!session) {
    throw new Error(`Missing fixture session for ${username}`);
  }
  await page.context().addCookies(session.cookies);
  await page.context().clearCookies({ name: /session_data/u });
};

const expectNeutral = async (
  page: Page,
  state: "anonymous" | "authenticated",
  count: number
) => {
  const controls = page
    .locator(`main button[data-visitor-state="${state}"]`)
    .filter({ visible: true });
  await expect(controls).toHaveCount(count);
  await expect(
    page.locator("main button[data-visitor-state]:not([disabled])")
  ).toHaveCount(0);
  await expect(
    page.locator('main button[data-visitor-state][aria-pressed="true"]')
  ).toHaveCount(0);
};

test.beforeAll(async ({ playwright, baseURL }) => {
  await Promise.all(
    ["alice", "bob"].map(async (username) => {
      const request = await playwright.request.newContext({ baseURL });
      const response = await request.post("/api/auth/sign-in/username", {
        headers: { Origin: baseURL ?? "http://localhost:3000" },
        data: { username, password: FIXTURE_PASSWORD },
      });
      expect(response.status()).toBe(200);
      const { cookies } = await request.storageState();
      sessions.set(username, { request, cookies });
    })
  );
});

test.afterAll(async ({ baseURL }) => {
  await Promise.all(
    [...sessions.values()].map(async ({ request }) => {
      await request.post("/api/auth/sign-out", {
        headers: { Origin: baseURL ?? "http://localhost:3000" },
      });
      await request.dispose();
    })
  );
  await pool.end();
});

test("anonymous feed and detail islands skip database session reads", async ({
  page,
}) => {
  const { posts } = await fixtures();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE sessions IN ACCESS EXCLUSIVE MODE");
    await page.goto("/?sort=new", { waitUntil: "commit" });
    await expectNeutral(page, "anonymous", 20);
    await expect(
      page.getByRole("link", { name: "Log in", exact: true })
    ).toBeVisible();
    await page.goto("/t/general", { waitUntil: "commit" });
    await expectNeutral(page, "anonymous", 20);
    await page.goto(`/p/${posts["thread-post"]}`, { waitUntil: "commit" });
    await expectNeutral(page, "anonymous", 1);
    await expect(
      page.getByRole("heading", { name: "thread-post", exact: true })
    ).toBeVisible();
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
});

for (const surface of ["feed", "detail"] as const) {
  test(`${surface} public content renders before the shared session lookup finishes`, async ({
    page,
  }) => {
    const { posts } = await fixtures();
    const path =
      surface === "feed" ? "/?sort=new" : `/p/${posts["thread-post"]}`;
    const count = surface === "feed" ? 20 : 1;
    await page.route("**/*", (route) =>
      route.request().headers()["next-router-prefetch"]
        ? route.abort()
        : route.continue()
    );
    await page.goto(path);
    await expectNeutral(page, "anonymous", count);
    await restoreSession(page, "alice");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("LOCK TABLE sessions IN ACCESS EXCLUSIVE MODE");
      await page.goto(path, { waitUntil: "commit" });
      await expect(
        page.getByRole("heading", {
          name: surface === "feed" ? "Posts" : "thread-post",
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.locator("main article").filter({ visible: true })
      ).toHaveCount(surface === "feed" ? 20 : 22);
      const neutral = page
        .locator('main button[data-visitor-state="pending"]')
        .first();
      await expect(neutral).toBeVisible();
      await expect(neutral).toBeDisabled();
      await expect(neutral).toHaveAttribute("aria-pressed", "false");
      const before = await neutral.boundingBox();
      await expect(
        page.getByRole("link", { name: "Log in", exact: true })
      ).toHaveCount(0);
      await expect
        .poll(async () => {
          const { rows } = await pool.query<{ count: number }>(
            "SELECT count(*)::int AS count FROM pg_stat_activity WHERE application_name = 'beacon-playwright' AND datname = current_database() AND wait_event_type = 'Lock' AND query LIKE '%\"sessions\"%'"
          );
          return rows[0].count;
        })
        .toBe(1);
      await client.query("ROLLBACK");
      await expectNeutral(page, "authenticated", count);
      await expect(
        page.getByRole("button", { name: "Open account menu for alice" })
      ).toBeVisible();
      const after = await page
        .locator('main button[data-visitor-state="authenticated"]')
        .first()
        .boundingBox();
      expect(after).toEqual(before);
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  });
}

test("visitor state stays request-specific across accounts, auth redirects, and signout", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await expectNeutral(page, "anonymous", 20);
  await restoreSession(page, "alice");
  await page.reload();
  await expectNeutral(page, "authenticated", 20);
  await expect(
    page.getByRole("button", { name: "Open account menu for alice" })
  ).toBeVisible();
  const other = await browser.newContext({
    baseURL: process.env.BETTER_AUTH_URL,
  });
  try {
    const otherPage = await other.newPage();
    await otherPage.goto("/");
    await expectNeutral(otherPage, "anonymous", 20);
    await restoreSession(otherPage, "bob");
    await otherPage.reload();
    await expectNeutral(otherPage, "authenticated", 20);
    await expect(
      otherPage.getByRole("button", { name: "Open account menu for bob" })
    ).toBeVisible();
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/u);
    await expect(
      page.getByRole("heading", { name: "Welcome back" })
    ).toHaveCount(0);
    await page.goto("/signup");
    await expect(page).toHaveURL(/\/dashboard$/u);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Open account menu for alice" })
      .click();
    await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("link", { name: "Log in", exact: true })
    ).toBeVisible();
    await expectNeutral(page, "anonymous", 20);
    await otherPage.reload();
    await expect(
      otherPage.getByRole("button", { name: "Open account menu for bob" })
    ).toBeVisible();
    await expectNeutral(otherPage, "authenticated", 20);
  } finally {
    await other.close();
  }
});
