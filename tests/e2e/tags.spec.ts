import { expect, test } from "@playwright/test";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.FIXTURE_DATABASE_URL });

test.afterAll(async () => {
  await pool.end();
});

test("popular tags match public counts and ordering", async ({ page }) => {
  const { rows } = await pool.query<{ tag: string; count: number }>(
    "SELECT tag, count(*)::int AS count FROM posts WHERE status = 'published' AND deleted_at IS NULL GROUP BY tag ORDER BY count DESC, tag ASC"
  );
  await page.goto("/tags");
  await expect(
    page.getByRole("heading", { name: "Popular tags" })
  ).toBeVisible();
  await expect(page.locator("main li")).toHaveCount(rows.length);
  const links = page.locator("main li a");
  await Promise.all(
    rows.map(async (row, index) => {
      await expect(links.nth(index)).toHaveAttribute("href", `/t/${row.tag}`);
      await expect(links.nth(index)).toHaveText(
        `#${row.tag}${row.count} ${row.count === 1 ? "post" : "posts"}`
      );
    })
  );
  await expect(page.locator('nav [aria-current="page"]')).toHaveText("Tags");
  await page.getByRole("link", { name: "#ranking", exact: false }).click();
  await expect(
    page.getByRole("heading", { name: "#ranking", exact: true })
  ).toBeVisible();
});

test("tag feeds filter public posts and preserve the tag during pagination", async ({
  page,
}) => {
  const { rows } = await pool.query<{ id: string }>(
    "SELECT id FROM posts WHERE tag = 'general' AND status = 'published' AND deleted_at IS NULL"
  );
  const expectedIDs = new Set(rows.map(({ id }) => id));
  const seen = new Set<string>();
  await page.goto("/t/general");
  await expect(page.locator('nav [aria-current="page"]')).toHaveText("Hot");
  let currentPage = 1;
  const checkPage = async (): Promise<void> => {
    const count = Math.min(20, rows.length - seen.size);
    await expect(page.locator("article")).toHaveCount(count);
    const articles = await page.locator("article").all();
    await Promise.all(
      articles.map(async (article) => {
        await expect(
          article.getByRole("link", { name: "#general", exact: true })
        ).toBeVisible();
        const href = await article
          .locator('a[href^="/p/"]')
          .first()
          .getAttribute("href");
        const id = href?.slice(3) ?? "";
        expect(expectedIDs.has(id)).toBe(true);
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      })
    );
    const next = page.getByRole("link", { name: "Next", exact: true });
    if (seen.size < rows.length) {
      currentPage += 1;
      await expect(next).toHaveAttribute(
        "href",
        `/t/general?page=${currentPage}`
      );
      await next.click();
      await checkPage();
    } else {
      await expect(next).toHaveCount(0);
    }
  };
  await checkPage();
  await page.goto("/t/general?page=1&sort=top");
  await expect(page).toHaveURL(/\/t\/general$/u);
  await page.goto("/t/general?page=999");
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});

for (const tag of ["unknown-tag", "INVALID", "invalid_tag"]) {
  test(`unavailable tag ${tag} shows not-found`, async ({ page }) => {
    await page.goto(`/t/${tag}`);
    await expect(
      page.getByRole("heading", { name: "Page not found" })
    ).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);
  });
}
