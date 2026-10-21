import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

import { expect } from "@playwright/test";
import { Pool } from "pg";
import { z } from "zod";

import { test } from "../fixtures/cold-app";

const pool = new Pool({ connectionString: process.env.FIXTURE_DATABASE_URL });
const manifestSchema = z.object({
  posts: z.record(z.string(), z.uuid()),
  comments: z.record(z.string(), z.uuid()),
});
const fixtures = async () =>
  manifestSchema.parse(
    JSON.parse(await readFile(".fixtures/manifest.json", "utf-8"))
  );

test.afterAll(async () => {
  await pool.end();
});

test("warm detail, thread, and comment locator reads survive database locks", async ({
  page,
  coldAppURL,
}) => {
  const { posts, comments } = await fixtures();
  const path = `${coldAppURL}/p/${posts["thread-post"]}`;
  const hint = comments["reply-last"];
  await page.goto(`${path}?comment=${hint}`);
  await expect(page.locator(`#comment-${hint}`)).toBeVisible();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE posts, comments IN ACCESS EXCLUSIVE MODE");
    await page.goto(`${path}?page=99&comment=${hint}`, { waitUntil: "commit" });
    await expect(
      page.getByRole("heading", { name: "thread-post", exact: true })
    ).toBeVisible();
    await expect(page.locator(`#comment-${hint}`)).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Comments" }).locator("article")
    ).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: "Previous", exact: true })
    ).toHaveAttribute("href", `/p/${posts["thread-post"]}`);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
});

for (const kind of ["missing", "draft"] as const) {
  test(`${kind} detail results are cached without exposing draft content`, async ({
    page,
    coldAppURL,
  }) => {
    const { posts } = await fixtures();
    const id =
      kind === "draft"
        ? posts["draft-private"]
        : "00000000-0000-4000-8000-000000000000";
    await page.goto(`${coldAppURL}/p/${id}`);
    await expect(
      page.getByRole("heading", { name: "Page not found", exact: true })
    ).toBeVisible();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("LOCK TABLE posts IN ACCESS EXCLUSIVE MODE");
      await page.goto(`${coldAppURL}/p/${id}?page=2`, { waitUntil: "commit" });
      await expect(
        page.getByRole("heading", { name: "Page not found", exact: true })
      ).toBeVisible();
      await expect(page.locator("main article")).toHaveCount(0);
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  });
}

test("hot home and tag caches expire without waiting for new and top caches", async ({
  request,
  coldAppURL,
}) => {
  test.setTimeout(100_000);
  const id = randomUUID();
  const title = `Cache expiration ${id}`;
  const paths = ["/", "/t/ranking", "/?sort=new", "/?sort=top"];
  const containsPost = async (path: string) => {
    const separator = path.includes("?") ? "&" : "?";
    const response = await request.get(
      `${coldAppURL}${path}${separator}probe=${randomUUID()}`
    );
    expect(response.status()).toBe(200);
    const body = await response.text();
    return body.includes(title);
  };
  try {
    await Promise.all(paths.map(containsPost));
    await pool.query(
      "INSERT INTO posts (id, author_id, title, tag, score, status, published_at) SELECT $1, id, $2, 'ranking', 2147483647, 'published', now() FROM users WHERE username = 'alice'",
      [id, title]
    );
    expect(await Promise.all(paths.map(containsPost))).toEqual([
      false,
      false,
      false,
      false,
    ]);
    await expect
      .poll(() => Promise.all(paths.slice(0, 2).map(containsPost)), {
        timeout: 80_000,
        intervals: [5000],
      })
      .toEqual([true, true]);
    expect(await Promise.all(paths.slice(2).map(containsPost))).toEqual([
      false,
      false,
    ]);
  } finally {
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  }
});
