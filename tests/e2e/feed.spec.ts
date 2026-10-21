import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

import { expect } from "@playwright/test";
import { Pool } from "pg";
import { z } from "zod";

import { test } from "../fixtures/cold-app";

const manifestSchema = z.object({ posts: z.record(z.string(), z.uuid()) });
const pool = new Pool({ connectionString: process.env.FIXTURE_DATABASE_URL });

test.afterAll(async () => {
  await pool.end();
});

for (const sort of ["hot", "new", "top"] as const) {
  test(`the ${sort} feed paginates and keeps its selected sort`, async ({
    page,
  }) => {
    const orders = {
      hot: "(score::bigint + 1) / power(greatest(extract(epoch from (CURRENT_TIMESTAMP - published_at)) / 3600, 0) + 2, 1.5) DESC, published_at DESC, id ASC",
      new: "published_at DESC, id ASC",
      top: "score DESC, published_at DESC, id ASC",
    };
    const { rows } = await pool.query<{ id: string }>(
      `SELECT id FROM posts WHERE status = 'published' AND deleted_at IS NULL ORDER BY ${orders[sort]}`
    );
    const checkOrder = async (currentPage: number) => {
      await expect
        .poll(() =>
          page
            .locator("main article")
            .filter({ visible: true })
            .evaluateAll((articles) =>
              articles.map((article) =>
                article.querySelector('a[href^="/p/"]')?.getAttribute("href")
              )
            )
        )
        .toEqual(
          rows
            .slice((currentPage - 1) * 20, currentPage * 20)
            .map(({ id }) => `/p/${id}`)
        );
    };
    await page.goto(sort === "hot" ? "/" : `/?sort=${sort}`);
    const sortNav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(sortNav.locator('[aria-current="page"]')).toHaveText(
      { hot: "Hot", new: "New", top: "Top" }[sort]
    );
    await expect(page.locator("article")).toHaveCount(20);
    await checkOrder(1);
    await expect(
      page.getByRole("link", { name: "Previous", exact: true })
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL(
      sort === "hot" ? /\?page=2$/u : new RegExp(`\\?sort=${sort}&page=2$`, "u")
    );
    await expect(page.locator("article")).toHaveCount(20);
    await checkOrder(2);
    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(5);
    await checkOrder(3);
    await expect(
      page.getByRole("link", { name: "Next", exact: true })
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Previous", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(20);
  });
}

test("feed URLs normalize defaults and reject out-of-range pages", async ({
  page,
}) => {
  await page.goto("/?sort=hot&page=2");
  await expect(page).toHaveURL(/\/\?page=2$/u);
  await page.goto("/?sort=top&page=1");
  await expect(page).toHaveURL(/\/\?sort=top$/u);
  await expect(page.locator("article")).toHaveCount(20);
  await page.goto("/?page=4");
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    "noindex"
  );
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});

for (const value of ["0", "-1", "1.5", "invalid"]) {
  test(`invalid page ${value} and sort fall back to the first hot page`, async ({
    page,
  }) => {
    await page.goto(`/?sort=invalid&page=${value}`);
    await expect(page.locator("article")).toHaveCount(20);
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation" })
        .locator('[aria-current="page"]')
    ).toHaveText("Hot");
    await expect(
      page.getByRole("link", { name: "Previous", exact: true })
    ).toHaveCount(0);
  });
}

test("cards separate external titles from discussion and author links", async ({
  page,
}) => {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(".fixtures/manifest.json", "utf-8"))
  );
  await page.goto("/?sort=new");
  const textCard = page.locator("article").filter({
    has: page.getByRole("heading", { name: "title-only", exact: true }),
  });
  const title = textCard.getByRole("link", { name: "title-only", exact: true });
  await expect(title).toHaveAttribute(
    "href",
    `/p/${manifest.posts["title-only"]}`
  );
  await title.focus();
  expect(
    await title.evaluate(
      (anchor) => getComputedStyle(anchor, "::after").boxShadow
    )
  ).not.toBe("none");
  await expect(
    textCard.getByRole("link", { name: "alice", exact: true })
  ).toHaveAttribute("href", "/u/alice");

  const linkCard = page.locator("article").filter({
    has: page.getByRole("heading", {
      name: "link-external (opens in a new tab)",
      exact: true,
    }),
  });
  const externalTitle = linkCard.getByRole("link", {
    name: "link-external (opens in a new tab)",
    exact: true,
  });
  await expect(externalTitle).toHaveAttribute(
    "href",
    "https://example.com/article"
  );
  await expect(externalTitle).toHaveAttribute("target", "_blank");
  await expect(externalTitle).toHaveAttribute(
    "rel",
    "noopener noreferrer nofollow ugc"
  );
  const discussion = linkCard.getByRole("link", {
    name: "Read 0 comments on link-external",
    exact: true,
  });
  await expect(discussion).toHaveAttribute(
    "href",
    `/p/${manifest.posts["link-external"]}`
  );
  expect(
    await discussion.evaluate(
      (anchor) => getComputedStyle(anchor, "::after").position
    )
  ).toBe("absolute");
  await expect(
    page.locator(`article a[href*="${manifest.posts["draft-private"]}"]`)
  ).toHaveCount(0);
  await expect(
    page.locator(`article a[href*="${manifest.posts["deleted-thread"]}"]`)
  ).toHaveCount(0);
});

test("hot feeds accept the maximum integer score without overflowing", async ({
  page,
  coldAppURL,
}) => {
  const id = randomUUID();
  try {
    await pool.query(
      "INSERT INTO posts (id, author_id, title, tag, score, status, published_at) SELECT $1, id, 'Maximum score regression', 'overflow-regression', 2147483647, 'published', now() FROM users WHERE username = 'alice'",
      [id]
    );
    await page.goto(coldAppURL);
    await expect(
      page
        .locator("main article")
        .first()
        .getByRole("heading", { name: "Maximum score regression", exact: true })
    ).toBeVisible();
    await page.goto(`${coldAppURL}/t/overflow-regression`);
    await expect(
      page.getByRole("heading", {
        name: "Maximum score regression",
        exact: true,
      })
    ).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(1);
  } finally {
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  }
});
