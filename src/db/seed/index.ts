import { mkdir, writeFile } from "node:fs/promises";

import { eq, or, sql } from "drizzle-orm";

import {
  createCommentFixtures,
  createPostFixtures,
  FIXTURE_PASSWORD,
  FIXTURE_USERNAMES,
  GENERATOR_SEED,
} from "./fixtures";
import type { FixtureUsers } from "./fixtures";

const seedReferenceTime = () => {
  const reference = process.env.SEED_REFERENCE_TIME ?? "2026-10-03T00:00:00Z";
  const referenceTime = new Date(reference);
  if (!reference.endsWith("Z") || Number.isNaN(referenceTime.getTime())) {
    throw new Error(
      "SEED_REFERENCE_TIME must be a valid UTC timestamp ending in Z."
    );
  }
  return referenceTime;
};

const seedConfiguration = () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeding is disabled in production.");
  }
  const fixtureURL = process.env.FIXTURE_DATABASE_URL;
  if (!fixtureURL || process.env.DATABASE_URL !== fixtureURL) {
    throw new Error(
      "Set DATABASE_URL and FIXTURE_DATABASE_URL to the same local or CI fixture database."
    );
  }
  const target = URL.parse(fixtureURL);
  if (!target) {
    throw new Error("FIXTURE_DATABASE_URL must be a valid Postgres URL.");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
  const ci = process.env.CI === "true" && target.hostname === "postgres";
  if (
    !["postgres:", "postgresql:"].includes(target.protocol) ||
    (!local && !ci) ||
    target.pathname !== "/beacon_fixture" ||
    target.search ||
    target.hash
  ) {
    throw new Error(
      "Seeding requires the local or CI beacon_fixture database."
    );
  }
  const referenceTime = seedReferenceTime();
  const appURL = URL.parse(
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  );
  if (
    !appURL ||
    !["http:", "https:"].includes(appURL.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(appURL.hostname) ||
    appURL.username ||
    appURL.password
  ) {
    throw new Error("BETTER_AUTH_URL must be a local test application URL.");
  }
  return { referenceTime, appURL };
};

const seed = async () => {
  const { referenceTime, appURL } = seedConfiguration();
  const [{ db, pool }, { users, posts, comments }, { auth }] =
    await Promise.all([
      import(".."),
      import("../schema"),
      import("../../lib/auth"),
    ]);
  try {
    const fixtureUsers: FixtureUsers = { alice: "", bob: "", charlie: "" };
    await Promise.all(
      FIXTURE_USERNAMES.map(async (username) => {
        const email = `${username}@example.test`;
        const existing = await db
          .select()
          .from(users)
          .where(or(eq(users.username, username), eq(users.email, email)));
        if (
          existing.length > 0 &&
          (existing.length !== 1 ||
            existing[0].username !== username ||
            existing[0].email !== email)
        ) {
          throw new Error(
            `Fixture user conflict for ${username}; resolve the existing account explicitly.`
          );
        }
        const result =
          existing.length > 0
            ? await auth.api.signInUsername({
                body: { username, password: FIXTURE_PASSWORD },
              })
            : await auth.api.signUpEmail({
                body: {
                  email,
                  username,
                  name: username,
                  password: FIXTURE_PASSWORD,
                },
              });
        fixtureUsers[username] = result.user.id;
      })
    );
    const fixtures = createPostFixtures(fixtureUsers, referenceTime, appURL);
    const commentFixtures = createCommentFixtures(fixtureUsers, fixtures);
    const postIds = Object.fromEntries(
      fixtures.map(({ name, id }) => [name, id])
    );
    postIds["lifecycle-draft"] = postIds["draft-private"];
    const karma = new Map(Object.values(fixtureUsers).map((id) => [id, 0]));
    for (const fixture of fixtures) {
      karma.set(
        fixture.originalAuthorId,
        (karma.get(fixture.originalAuthorId) ?? 0) + (fixture.score ?? 0)
      );
    }
    for (const fixture of commentFixtures) {
      karma.set(
        fixture.authorId,
        (karma.get(fixture.authorId) ?? 0) + (fixture.score ?? 0)
      );
    }
    await db.transaction(async (tx) => {
      await tx.execute(sql`TRUNCATE TABLE comments, posts`);
      await tx
        .insert(posts)
        .values(
          fixtures.map(
            ({ name: _name, originalAuthorId: _author, ...post }) => post
          )
        );
      await tx
        .insert(comments)
        .values(commentFixtures.map(({ name: _name, ...comment }) => comment));
      await tx.execute(
        sql`UPDATE posts SET comment_count = (SELECT count(*)::integer FROM comments WHERE comments.post_id = posts.id)`
      );
      const karmaRows = Object.values(fixtureUsers).map(
        (id) => sql`(${id}::uuid, ${karma.get(id) ?? 0}::integer)`
      );
      await tx.execute(
        sql`UPDATE users AS u SET karma = fixture.karma FROM (VALUES ${sql.join(karmaRows, sql`, `)}) AS fixture(id, karma) WHERE u.id = fixture.id`
      );
    });
    await mkdir(".fixtures", { recursive: true });
    await writeFile(
      ".fixtures/manifest.json",
      `${JSON.stringify(
        {
          generatorSeed: GENERATOR_SEED,
          referenceTime: referenceTime.toISOString(),
          users: fixtureUsers,
          posts: postIds,
          comments: Object.fromEntries(
            commentFixtures.map(({ name, id }) => [name, id])
          ),
          originalAuthors: Object.fromEntries(
            fixtures.map(({ id, originalAuthorId }) => [id, originalAuthorId])
          ),
        },
        null,
        2
      )}\n`
    );
    process.stdout.write(
      "Seeded 45 public posts, one draft, and one deleted post, and 25 comments. Manifest: .fixtures/manifest.json\n"
    );
  } finally {
    await pool.end();
  }
};

await seed();
