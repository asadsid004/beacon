import { createHash } from "node:crypto";

import type { comments, posts } from "../schema";

export const FIXTURE_PASSWORD = "Beacon-fixture-2026!";
export const FIXTURE_USERNAMES = ["alice", "bob", "charlie"] as const;
export type FixtureUsername = (typeof FIXTURE_USERNAMES)[number];
export type FixtureUsers = Record<FixtureUsername, string>;
export const GENERATOR_SEED = "beacon-v1";

export const createGenerator = (stream = "") => {
  let state = createHash("sha256")
    .update(GENERATOR_SEED)
    .update(stream)
    .digest()
    .readUInt32BE(0);
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
};

export const fixtureId = (random: () => number) => {
  const bytes = Buffer.from(
    Array.from({ length: 16 }, () => Math.floor(random() * 256))
  );
  bytes[6] = (bytes[6] % 16) + 64;
  bytes[8] = (bytes[8] % 64) + 128;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

type PostFixture = typeof posts.$inferInsert & {
  name: string;
  originalAuthorId: string;
};

export const createPostFixtures = (
  users: FixtureUsers,
  referenceTime: Date,
  appURL: URL
) => {
  const random = createGenerator();
  const fixtures: PostFixture[] = [];
  const ago = (hours: number) =>
    new Date(referenceTime.getTime() - hours * 3_600_000);
  const add = (
    name: string,
    hours: number,
    fields: Partial<typeof posts.$inferInsert> = {}
  ) => {
    fixtures.push({
      name,
      originalAuthorId: users.alice,
      id: fixtureId(random),
      authorId: users.alice,
      title: name,
      tag: "general",
      url: null,
      headerImageUrl: null,
      body: null,
      score: 0,
      commentCount: 0,
      status: "published",
      deletedAt: null,
      createdAt: ago(hours + 1),
      publishedAt: ago(hours),
      ...fields,
    });
  };
  add("rank-old-high", 24, { tag: "ranking", score: 50 });
  add("rank-fresh", 2, { tag: "ranking", score: 5 });
  add("rank-zero", 0.5, { tag: "ranking" });
  add("rank-old-low", 100, { tag: "ranking", score: 1 });
  const tieIds = [fixtureId(random), fixtureId(random)].toSorted();
  add("tie-a", 6, { tag: "ties", score: 3, id: tieIds[0] });
  add("tie-b", 6, { tag: "ties", score: 3, id: tieIds[1] });
  add("title-only", 3);
  add("text-body", 4, {
    body: "## A readable discussion\n\nA paragraph with **bold text** and a [source](https://example.com/source).\n\n- First point\n- Second point\n\n<script>alert('hidden')</script>\n\n![Hidden body image](https://example.com/hidden.png)",
  });
  add("link-external", 5, { url: "https://example.com/article" });
  add("header-valid", 7, {
    headerImageUrl: new URL("/fixtures/header.png", appURL).href,
  });
  add("header-broken", 8, {
    headerImageUrl: new URL("/fixtures/missing.png", appURL).href,
  });
  add("thread-post", 9);
  add("lifecycle-clean", 10, { tag: "lifecycle" });
  add("lifecycle-thread", 11, { tag: "lifecycle" });
  add("date-relative", 6 * 24 + 23);
  add("date-absolute", 7 * 24 + 1);
  for (let index = 1; fixtures.length < 45; index += 1) {
    add(`filler-${String(index).padStart(2, "0")}`, 8 * 24 + index);
  }
  add("draft-private", 12, {
    status: "draft",
    publishedAt: null,
    tag: "lifecycle",
  });
  add("deleted-thread", 13, {
    authorId: null,
    score: 2,
    deletedAt: ago(1),
    body: "This post was deleted by the author.",
  });
  return fixtures;
};

type CommentFixture = typeof comments.$inferInsert & {
  name: string;
};

export const createCommentFixtures = (
  users: FixtureUsers,
  postFixtures: ReturnType<typeof createPostFixtures>
) => {
  const random = createGenerator("comments");
  const fixtures: CommentFixture[] = [];
  const post = (name: string) => {
    const match = postFixtures.find((fixture) => fixture.name === name);
    if (!match?.id || !match.publishedAt) {
      throw new Error(`Missing published post fixture: ${name}`);
    }
    return { id: match.id, publishedAt: match.publishedAt };
  };
  const thread = post("thread-post");
  for (let index = 0; index < 21; index += 1) {
    fixtures.push({
      name: `thread-${index + 1}`,
      id: fixtureId(random),
      postId: thread.id,
      authorId: users.bob,
      parentCommentId: null,
      body: `Top level comment ${index + 1}. Plain text: **not Markdown**.`,
      score: 2,
      createdAt: new Date(thread.publishedAt.getTime() + (index + 1) * 60_000),
    });
  }
  fixtures[0].name = "thread-first";
  fixtures[20].name = "thread-last";
  for (const [name, parentName] of [
    ["reply-first", "thread-first"],
    ["reply-last", "thread-last"],
  ]) {
    const parent = fixtures.find((fixture) => fixture.name === parentName);
    if (!parent?.id || !parent.createdAt) {
      throw new Error(`Missing parent fixture: ${parentName}`);
    }
    fixtures.push({
      name,
      id: fixtureId(random),
      postId: thread.id,
      authorId: users.alice,
      parentCommentId: parent.id,
      body: `Reply to ${parentName}.`,
      score: 1,
      createdAt: new Date(parent.createdAt.getTime() + 30_000),
    });
  }
  for (const name of ["lifecycle-thread", "deleted-thread"]) {
    const owner = post(name);
    fixtures.push({
      name: `${name}-comment`,
      id: fixtureId(random),
      postId: owner.id,
      authorId: users.bob,
      parentCommentId: null,
      body: "This discussion remains readable.",
      score: 3,
      createdAt: new Date(owner.publishedAt.getTime() + 60_000),
    });
  }
  return fixtures;
};
