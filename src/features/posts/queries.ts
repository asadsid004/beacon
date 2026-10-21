import "server-only";
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { PAGE_SIZE } from "@/lib/pagination";

import type { FeedSort } from "./feed-params";

export const HOT_RANKING_EXPONENT = 1.5;

const readPublicPost = async (id: string) => {
  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      tag: posts.tag,
      score: posts.score,
      commentCount: posts.commentCount,
      body: posts.body,
      headerImageUrl: posts.headerImageUrl,
      deletedAt: posts.deletedAt,
      publishedAt: sql`${posts.publishedAt}`.mapWith(
        (value: string) => new Date(value)
      ),
      authorUsername: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.id, id), eq(posts.status, "published")))
    .limit(1);
  return post ?? null;
};

export const getPublicPost = cache(readPublicPost);

export const getPublicAuthorPostCount = async (authorId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(posts)
    .where(
      and(
        eq(posts.authorId, authorId),
        eq(posts.status, "published"),
        isNull(posts.deletedAt)
      )
    );
  return result.count;
};

export const getPopularTags = async () => {
  const postCount = count();
  return await db
    .select({ tag: posts.tag, postCount })
    .from(posts)
    .where(and(eq(posts.status, "published"), isNull(posts.deletedAt)))
    .groupBy(posts.tag)
    .orderBy(desc(postCount), asc(posts.tag));
};

const readPublicPostList = async ({
  sort,
  page,
  tag,
  authorId,
}: {
  sort: FeedSort;
  page: number;
  tag?: string;
  authorId?: string;
}) => {
  const hotRank = sql`(${posts.score}::bigint + 1) / power(greatest(extract(epoch from (CURRENT_TIMESTAMP - ${posts.publishedAt})) / 3600, 0) + 2, ${HOT_RANKING_EXPONENT})`;
  const order = [desc(posts.publishedAt), asc(posts.id)];
  if (sort === "hot") {
    order.unshift(desc(hotRank));
  } else if (sort === "top") {
    order.unshift(desc(posts.score));
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      tag: posts.tag,
      score: posts.score,
      commentCount: posts.commentCount,
      publishedAt: sql`${posts.publishedAt}`.mapWith(
        (value: string) => new Date(value)
      ),
      authorUsername: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(
      and(
        eq(posts.status, "published"),
        isNull(posts.deletedAt),
        tag === undefined ? undefined : eq(posts.tag, tag),
        authorId === undefined ? undefined : eq(posts.authorId, authorId)
      )
    )
    .orderBy(...order)
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);

  return {
    posts: rows.slice(0, PAGE_SIZE),
    hasNext: rows.length > PAGE_SIZE,
    page,
  };
};

export const getPublicFeed = async ({
  sort,
  page,
  tag,
}: {
  sort: FeedSort;
  page: number;
  tag?: string;
}) => await readPublicPostList({ sort, page, tag });

export const getPublicAuthorHistory = async (authorId: string, page: number) =>
  await readPublicPostList({ sort: "new", page, authorId });

export type FeedPost = Awaited<
  ReturnType<typeof getPublicFeed>
>["posts"][number];
