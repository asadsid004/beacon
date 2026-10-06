import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { posts } from "./posts-schema";

export const comments = pgTable(
  "comments",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentCommentId: uuid("parent_comment_id").references(
      (): AnyPgColumn => comments.id,
      { onDelete: "cascade" }
    ),
    body: text("body").notNull(),
    score: integer("score").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("comments_post_id_idx").on(table.postId),
    index("comments_post_parent_idx").on(table.postId, table.parentCommentId),
    check(
      "comments_body_check",
      sql`char_length(${table.body}) <= 5000 AND ${table.body} ~ '[^[:space:]]'`
    ),
    check("comments_score_check", sql`${table.score} >= 0`),
  ]
);
