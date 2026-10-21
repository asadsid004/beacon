import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import { z } from "zod";

const schema = z.object({
  posts: z.record(z.string(), z.uuid()),
  comments: z.record(z.string(), z.uuid()),
});
const fixtures = async () =>
  schema.parse(JSON.parse(await readFile(".fixtures/manifest.json", "utf-8")));

test("copy controls share canonical post and anchored comment links while votes stay disabled", async ({
  page,
}) => {
  const { posts, comments } = await fixtures();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: (text: string) => {
          localStorage.setItem("copied-link", text);
          return Promise.resolve();
        },
      },
    });
  });
  const path = `/p/${posts["thread-post"]}`;
  await page.goto(`${path}?page=2`);
  await expect(
    page.getByRole("button", { name: "Copy link to this post", exact: true })
  ).toHaveCount(0);
  const reply = page.locator(`#comment-${comments["reply-last"]}`);
  const commentCopy = reply.getByRole("button", {
    name: "Copy link to this comment",
    exact: true,
  });
  await commentCopy.click();
  await expect(commentCopy).toHaveText("Copied");
  expect(await page.evaluate(() => localStorage.getItem("copied-link"))).toBe(
    new URL(`${path}#comment-${comments["reply-last"]}`, page.url()).href
  );
  await expect(commentCopy).toHaveText("Copy link", { timeout: 3000 });
  await expect(
    reply.getByRole("button", { name: "Reply", exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Reply", exact: true })
  ).toHaveCount(1);
  await page.goto(`${path}#comment-${comments["reply-last"]}`);
  await expect(reply).toBeFocused();
  const votes = page.getByRole("button", { name: /^Upvote/u });
  await expect(votes).toHaveCount(3);
  const voteButtons = await votes.all();
  await Promise.all(voteButtons.map((vote) => expect(vote).toBeDisabled()));
});

test("copy failures show feedback and allow retrying", async ({ page }) => {
  const { posts } = await fixtures();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => Promise.reject(new Error("Clipboard unavailable")),
      },
    });
  });
  await page.goto(`/p/${posts["thread-post"]}`);
  const copy = page.getByRole("button", {
    name: "Copy link to this comment",
    exact: true,
  });
  const firstCopy = copy.first();
  await firstCopy.click();
  await expect(
    page.getByText("Could not copy the link. Try again.", { exact: true })
  ).toHaveCount(1);
  await expect(firstCopy).toBeEnabled();
});

test("threads paginate top-level comments and keep replies on the parent page", async ({
  page,
}) => {
  const { posts, comments } = await fixtures();
  const path = `/p/${posts["thread-post"]}`;
  await page.goto(path);
  const thread = page.getByRole("region", { name: "Comments" });
  await expect(thread.locator("article")).toHaveCount(21);
  await expect(
    page.locator(`#comment-${comments["reply-first"]}`)
  ).toBeVisible();
  await expect(page.locator(`#comment-${comments["reply-last"]}`)).toHaveCount(
    0
  );
  await expect(thread.locator("strong")).toHaveCount(0);
  await expect(
    thread.getByText("Top level comment 1. Plain text: **not Markdown**.", {
      exact: true,
    })
  ).toBeVisible();
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${path}\\?page=2$`, "u"));
  await expect(thread.locator("article")).toHaveCount(2);
  await expect(
    page.locator(`#comment-${comments["reply-last"]}`)
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Next", exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Previous", exact: true })
  ).toHaveAttribute("href", path);
  await page.goto(`${path}?page=3`);
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});

test("reply hints override stale pages and focus their anchors", async ({
  page,
}) => {
  const { posts, comments } = await fixtures();
  const path = `/p/${posts["thread-post"]}`;
  const id = comments["reply-last"];
  await page.goto(`${path}?page=999&comment=${id}#comment-${id}`);
  const reply = page.locator(`#comment-${id}`);
  await expect(reply).toBeVisible();
  await expect(reply).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Comments" }).locator("article")
  ).toHaveCount(2);
  await page.getByRole("link", { name: "Previous", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`, "u"));
  await expect(
    page.getByRole("region", { name: "Comments" }).locator("article")
  ).toHaveCount(21);
});

test("invalid and foreign comment hints fall back to normal pagination", async ({
  page,
}) => {
  const { posts, comments } = await fixtures();
  const path = `/p/${posts["thread-post"]}`;
  await page.goto(`${path}?page=2&comment=invalid`);
  await expect(
    page.getByRole("region", { name: "Comments" }).locator("article")
  ).toHaveCount(2);
  await page.goto(
    `${path}?page=2&comment=${comments["deleted-thread-comment"]}`
  );
  await expect(
    page.getByRole("region", { name: "Comments" }).locator("article")
  ).toHaveCount(2);
  await page.goto(`${path}?page=1`);
  await expect(page).toHaveURL(new RegExp(`${path}$`, "u"));
});

test("empty threads and deleted-post discussions stay readable", async ({
  page,
}) => {
  const { posts } = await fixtures();
  await page.goto(`/p/${posts["title-only"]}`);
  await expect(
    page.getByText("No comments yet.", { exact: true })
  ).toBeVisible();
  await page.goto(`/p/${posts["deleted-thread"]}`);
  await expect(
    page.getByText("This post was deleted by the author.")
  ).toBeVisible();
  await expect(
    page.getByText("This discussion remains readable.")
  ).toBeVisible();
  await page.goto(`/p/${posts["draft-private"]}`);
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Comments" })).toHaveCount(0);
});
