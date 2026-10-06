import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";

export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    url: text("url"),
    headerImageUrl: text("header_image_url"),
    body: text("body"),
    tag: text("tag").notNull(),
    score: integer("score").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    status: postStatus("status").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    index("posts_publication_idx").on(
      table.status,
      table.deletedAt,
      table.publishedAt
    ),
    index("posts_tag_idx").on(table.tag),
    check(
      "posts_title_check",
      sql`char_length(${table.title}) <= 200 AND ${table.title} ~ '[^[:space:]]' AND strpos(${table.title}, chr(13)) = 0 AND strpos(${table.title}, chr(10)) = 0`
    ),
    check("posts_url_length_check", sql`char_length(${table.url}) <= 2048`),
    check(
      "posts_header_image_url_length_check",
      sql`char_length(${table.headerImageUrl}) <= 2048`
    ),
    check("posts_body_length_check", sql`char_length(${table.body}) <= 20000`),
    check(
      "posts_tag_check",
      sql`char_length(${table.tag}) <= 30 AND ${table.tag} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`
    ),
    check("posts_score_check", sql`${table.score} >= 0`),
    check("posts_comment_count_check", sql`${table.commentCount} >= 0`),
    check(
      "posts_published_at_check",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`
    ),
    check(
      "posts_deleted_status_check",
      sql`${table.deletedAt} IS NULL OR ${table.status} = 'published'`
    ),
  ]
);
