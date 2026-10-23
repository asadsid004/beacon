import { createHash, randomBytes } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import { eq, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { accounts, users } from "../schema/auth-schema";
import { comments } from "../schema/comments-schema";
import { posts } from "../schema/posts-schema";
import {
  articles,
  conversations,
  discussions,
  members,
  replies,
} from "./content";

const demoId = (key: string) => {
  const hex = createHash("sha256")
    .update(`beacon-demo-v1:${key}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const mainId = demoId("main-user");
const mainEmail = "alex.morgan@example.com";
const mainUsername = "alexm";

const configuration = () => {
  const databaseURL = process.env.DATABASE_URL;
  if (!databaseURL) {
    throw new Error("Set DATABASE_URL to the database you want to populate.");
  }
  const target = URL.parse(databaseURL);
  if (!target || !["postgres:", "postgresql:"].includes(target.protocol)) {
    throw new Error("DATABASE_URL must use PostgreSQL.");
  }
  const referenceTime = new Date(process.env.DEMO_REFERENCE_TIME ?? Date.now());
  if (Number.isNaN(referenceTime.getTime())) {
    throw new TypeError("DEMO_REFERENCE_TIME must be a valid timestamp.");
  }
  const password =
    process.env.DEMO_PASSWORD ?? randomBytes(24).toString("base64url");
  if (password.length < 12 || password.length > 128) {
    throw new Error("DEMO_PASSWORD must contain 12 to 128 characters.");
  }
  return { databaseURL, referenceTime, password };
};

const createContent = (referenceTime: Date) => {
  const ago = (hours: number) =>
    new Date(referenceTime.getTime() - hours * 3_600_000);
  const authors = [mainId, ...members.map(([name]) => demoId(`user:${name}`))];
  const seeds = [
    ...articles.map(([title, tag, url]) => ({ title, tag, url, body: null })),
    ...discussions.map(([title, tag, body]) => ({
      title,
      tag,
      body,
      url: null,
    })),
  ];
  const postRows: (typeof posts.$inferInsert)[] = [];
  const commentRows: (typeof comments.$inferInsert)[] = [];
  for (const [index, seed] of seeds.entries()) {
    // Interleave fresh and older submissions so hot, new, and top differ.
    const hours =
      index % 4 === 0 ? 0.25 + index / 4 : 5 + ((index * 37) % 1000);
    const publishedAt = ago(hours);
    const postId = demoId(`post:${seed.title}`);
    const rootCount = index % 7 === 0 ? 0 : 2 + ((index * 7) % 10);
    let pool: readonly string[] = conversations.systems;
    if (seed.tag === "ai") {
      pool = conversations.ai;
    } else if (["databases", "search"].includes(seed.tag)) {
      pool = conversations.data;
    } else if (
      ["observability", "reliability", "performance", "networking"].includes(
        seed.tag
      )
    ) {
      pool = conversations.operations;
    }
    const threadComments = [...pool, ...conversations.general];
    for (let number = 0; number < rootCount; number += 1) {
      const id = demoId(`comment:${index}:${number}`);
      const createdAt = new Date(
        publishedAt.getTime() +
          (referenceTime.getTime() - publishedAt.getTime()) *
            ((number + 1) / (rootCount + 2))
      );
      commentRows.push({
        id,
        postId,
        authorId: authors[(index + number + 1) % authors.length],
        body: threadComments[number % threadComments.length],
        score: (index * 3 + number * 7) % 31,
        createdAt,
      });
      if (number % 2 === 0) {
        commentRows.push({
          id: demoId(`reply:${index}:${number}`),
          postId,
          authorId: authors[(index + number + 9) % authors.length],
          parentCommentId: id,
          body: replies[(index + number) % replies.length],
          score: (index + number) % 13,
          createdAt: new Date(createdAt.getTime() + 60_000),
        });
      }
    }
    postRows.push({
      ...seed,
      id: postId,
      authorId: index % 7 === 0 ? mainId : authors[index % authors.length],
      status: "published",
      createdAt: ago(hours + 1),
      publishedAt,
      score: index % 9 === 0 ? 0 : 3 + ((index * 43) % 280),
      commentCount: rootCount + Math.ceil(rootCount / 2),
    });
  }
  return { postRows, commentRows, ago };
};

const seed = async () => {
  const { databaseURL, referenceTime, password } = configuration();
  const pool = new Pool({ connectionString: databaseURL });
  const db = drizzle(pool);
  try {
    const passwordHash = await hashPassword(password);
    const { postRows, commentRows, ago } = createContent(referenceTime);
    const result = await db.transaction(async (tx) => {
      // Serialize reruns without locking unrelated application writes.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(64920813)`);
      const existing = await tx
        .select()
        .from(users)
        .where(
          or(
            eq(users.id, mainId),
            eq(users.email, mainEmail),
            eq(users.username, mainUsername)
          )
        );
      if (existing.some((user) => user.id !== mainId)) {
        throw new Error(
          "The demo email or username belongs to another account. No demo data was written."
        );
      }
      const newMain = existing.length === 0;
      if (newMain) {
        await tx.insert(users).values({
          id: mainId,
          name: "Alex Morgan",
          email: mainEmail,
          username: mainUsername,
          emailVerified: true,
          createdAt: ago(24 * 90),
        });
        await tx.insert(accounts).values({
          id: demoId("main-account"),
          userId: mainId,
          accountId: mainId,
          providerId: "credential",
          password: passwordHash,
        });
      }
      // Rename only the original seeded identities. Stable IDs preserve their
      // posts, comments, credentials, and any later account customizations.
      const identities = [
        sql`(${mainId}::uuid, ${"Alex Morgan"}, ${mainEmail}, ${mainUsername}, ${"demo@beacon.example"}, ${"beacon_demo"})`,
        ...members.map(
          ([name, username], index) =>
            sql`(${demoId(`user:${name}`)}::uuid, ${name}, ${`${name.toLowerCase().replaceAll(" ", ".")}@example.com`}, ${username}, ${`member${index + 1}@demo.beacon.example`}, ${`demo_${name.toLowerCase().replaceAll(" ", "_")}`})`
        ),
      ];
      await tx.execute(sql`UPDATE users AS u SET
        name = CASE WHEN u.name = 'Beacon Demo' THEN identity.name ELSE u.name END,
        email = CASE WHEN u.email = identity.old_email THEN identity.email ELSE u.email END,
        username = CASE WHEN u.username = identity.old_username THEN identity.username ELSE u.username END
        FROM (VALUES ${sql.join(identities, sql`, `)}) AS identity(id, name, email, username, old_email, old_username)
        WHERE u.id = identity.id AND (u.email = identity.old_email OR u.username = identity.old_username OR u.name = 'Beacon Demo')`);
      const insertedUsers = await tx
        .insert(users)
        .values(
          members.map(([name, username], index) => ({
            id: demoId(`user:${name}`),
            name,
            email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
            username,
            emailVerified: false,
            createdAt: ago(24 * (60 + index * 3)),
          }))
        )
        .onConflictDoNothing({ target: users.id })
        .returning({ id: users.id });
      // oxlint-disable-next-line react-doctor/server-sequential-independent-await -- Posts reference the users inserted above.
      const insertedPosts = await tx
        .insert(posts)
        .values(postRows)
        .onConflictDoNothing({ target: posts.id })
        .returning({ authorId: posts.authorId, score: posts.score });
      // Parents are inserted first; replies never point to other replies.
      const insertComments = (rows: (typeof comments.$inferInsert)[]) =>
        tx
          .insert(comments)
          .values(rows)
          .onConflictDoNothing({ target: comments.id })
          .returning({ authorId: comments.authorId, score: comments.score });
      // oxlint-disable-next-line react-doctor/server-sequential-independent-await -- Comments reference the posts inserted above.
      const insertedRoots = await insertComments(
        commentRows.filter((row) => !row.parentCommentId)
      );
      // oxlint-disable-next-line react-doctor/server-sequential-independent-await -- Replies reference the root comments inserted above.
      const insertedReplies = await insertComments(
        commentRows.filter((row) => row.parentCommentId)
      );
      const insertedComments = [...insertedRoots, ...insertedReplies];
      // Phase 1 has synthetic scores and no votes table. Add only newly inserted
      // demo scores to karma so reruns preserve subsequent application activity.
      const karma = new Map<string, number>();
      for (const row of [...insertedPosts, ...insertedComments]) {
        if (row.authorId) {
          karma.set(row.authorId, (karma.get(row.authorId) ?? 0) + row.score);
        }
      }
      if (karma.size > 0) {
        const values = [...karma].map(
          ([id, score]) => sql`(${id}::uuid, ${score}::integer)`
        );
        await tx.execute(
          sql`UPDATE users AS u SET karma = u.karma + demo.score FROM (VALUES ${sql.join(values, sql`, `)}) AS demo(id, score) WHERE u.id = demo.id`
        );
      }
      const ids = postRows.map((post) => sql`${post.id}::uuid`);
      await tx.execute(
        sql`UPDATE posts SET comment_count = (SELECT count(*)::integer FROM comments WHERE comments.post_id = posts.id) WHERE id IN (${sql.join(ids, sql`, `)})`
      );
      return {
        newMain,
        users: insertedUsers.length + Number(newMain),
        posts: insertedPosts.length,
        comments: insertedComments.length,
      };
    });
    process.stdout.write(
      `Added ${result.users} users, ${result.posts} posts, and ${result.comments} comments.\n`
    );
    process.stdout.write(`Main account: ${mainEmail} / ${mainUsername}\n`);
    process.stdout.write(
      result.newMain
        ? `Password: ${password}\n`
        : "Existing main account password preserved.\n"
    );
  } finally {
    await pool.end();
  }
};

await seed();
