import { expect, test } from "@playwright/test";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.FIXTURE_DATABASE_URL });

test.afterAll(async () => {
  await pool.end();
});

test("feed author links open a public profile with ordered, paginated posts", async ({
  page,
}) => {
  const { rows } = await pool.query<{ id: string }>(
    "SELECT p.id FROM posts p JOIN users u ON p.author_id = u.id WHERE u.username = 'alice' AND p.status = 'published' AND p.deleted_at IS NULL ORDER BY p.published_at DESC, p.id ASC"
  );
  await page.goto("/?sort=new");
  const card = page
    .locator("article")
    .filter({ visible: true })
    .filter({
      has: page.getByRole("heading", { name: "title-only", exact: true }),
    });
  await card.getByRole("link", { name: "alice", exact: true }).click();
  await expect(page).toHaveURL(/\/u\/alice$/u);
  await expect(page).toHaveTitle(/alice/u);
  await expect(
    page.getByRole("heading", { name: "@alice", exact: true })
  ).toBeVisible();
  await expect(page.locator("main header")).toContainText(
    `${rows.length} posts`
  );
  await expect(page.locator("main header time")).toBeVisible();
  await expect(
    page.locator('article a[href="/u/alice"]').filter({ visible: true })
  ).toHaveCount(0);
  const checkPage = async (currentPage: number): Promise<void> => {
    const expected = rows.slice((currentPage - 1) * 20, currentPage * 20);
    await expect(page.locator("article").filter({ visible: true })).toHaveCount(
      expected.length
    );
    const hrefs = await page
      .locator("article")
      .filter({ visible: true })
      .evaluateAll((articles) =>
        articles.map((article) =>
          article.querySelector('a[href^="/p/"]')?.getAttribute("href")
        )
      );
    expect(hrefs).toEqual(expected.map(({ id }) => `/p/${id}`));
    const next = page.getByRole("link", { name: "Next", exact: true });
    if (currentPage * 20 < rows.length) {
      await expect(next).toHaveAttribute(
        "href",
        `/u/alice?page=${currentPage + 1}`
      );
      await next.click();
      await expect(
        page.getByRole("link", { name: "Previous", exact: true })
      ).toHaveAttribute(
        "href",
        currentPage === 1 ? "/u/alice" : `/u/alice?page=${currentPage}`
      );
      await checkPage(currentPage + 1);
    } else {
      await expect(next).toHaveCount(0);
    }
  };
  await checkPage(1);
  await page.goto("/u/alice?page=1");
  await expect(page).toHaveURL(/\/u\/alice$/u);
  await page.goto("/u/alice?page=invalid");
  await expect(page.locator("article").filter({ visible: true })).toHaveCount(
    20
  );
});

test("profiles show stored karma and a useful empty state", async ({
  page,
}) => {
  const {
    rows: [bob],
  } = await pool.query<{ karma: number }>(
    "SELECT karma FROM users WHERE username = 'bob'"
  );
  expect(bob.karma).toBeGreaterThan(0);
  await page.goto("/u/bob");
  await expect(page.locator("main header .font-mono").first()).toHaveText(
    new Intl.NumberFormat("en-US").format(bob.karma)
  );
  await page.goto("/u/charlie");
  await expect(
    page.getByRole("heading", { name: "@charlie", exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("This author has no published posts yet.")
  ).toBeVisible();
  await expect(page.locator("article").filter({ visible: true })).toHaveCount(
    0
  );
  await expect(
    page.getByRole("navigation", { name: "Pagination" })
  ).toHaveCount(0);
});

for (const route of [
  "/u/unknown-fixture-user",
  "/u/INVALID!",
  "/u/alice?page=999",
  "/u/charlie?page=2",
]) {
  test(`${route} shows not-found without exposing posts`, async ({ page }) => {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "Page not found" })
    ).toBeVisible();
    await expect(page.locator("article").filter({ visible: true })).toHaveCount(
      0
    );
  });
}
