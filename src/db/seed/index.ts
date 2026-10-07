import { mkdir, writeFile } from "node:fs/promises";

import { eq, or, sql } from "drizzle-orm";

import {
  createPostFixtures,
  FIXTURE_PASSWORD,
  FIXTURE_USERNAMES,
  GENERATOR_SEED,
} from "./fixtures";
import type { FixtureUsers } from "./fixtures";

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
  const target = new URL(fixtureURL);
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
  const reference = process.env.SEED_REFERENCE_TIME ?? "2026-10-03T00:00:00Z";
  const referenceTime = new Date(reference);
  if (!reference.endsWith("Z") || Number.isNaN(referenceTime.getTime())) {
    throw new Error(
      "SEED_REFERENCE_TIME must be a valid UTC timestamp ending in Z."
    );
  }
  const appURL = new URL(
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  );
  if (
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
  const [{ db, pool }, { users, posts }, { auth }] = await Promise.all([
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
    const postIds = Object.fromEntries(
      fixtures.map(({ name, id }) => [name, id])
    );
    postIds["lifecycle-draft"] = postIds["draft-private"];
    await db.transaction(async (tx) => {
      await tx.execute(sql`TRUNCATE TABLE comments, posts`);
      await tx
        .insert(posts)
        .values(
          fixtures.map(
            ({ name: _name, originalAuthorId: _author, ...post }) => post
          )
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
          originalAuthors: Object.fromEntries(
            fixtures.map(({ id, originalAuthorId }) => [id, originalAuthorId])
          ),
        },
        null,
        2
      )}\n`
    );
    process.stdout.write(
      "Seeded 45 public posts, one draft, and one deleted post. Manifest: .fixtures/manifest.json\n"
    );
  } finally {
    await pool.end();
  }
};

await seed();
