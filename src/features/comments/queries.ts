import "server-only";
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { PAGE_SIZE } from "@/lib/pagination";

const fields = {
  id: comments.id,
  parentCommentId: comments.parentCommentId,
  body: comments.body,
  score: comments.score,
  createdAt: comments.createdAt,
  username: users.username,
};

export const getCommentPage = async (postId: string, commentId: string) => {
  "use cache";
  cacheLife("minutes");
  cacheTag(`comments-${postId}`);
  const result = await db.execute(sql`
    WITH target AS (
      SELECT coalesce(parent_comment_id, id) AS ancestor FROM comments
      WHERE post_id = ${postId} AND id = ${commentId}
    ), ranked AS (
      SELECT id, row_number() OVER (ORDER BY score DESC, created_at ASC, id ASC) AS position
      FROM comments WHERE post_id = ${postId} AND parent_comment_id IS NULL
    )
    SELECT position FROM ranked WHERE id = (SELECT ancestor FROM target)
  `);
  const position = Number(result.rows[0]?.position);
  return position > 0 ? Math.floor((position - 1) / PAGE_SIZE) + 1 : null;
};

export const getPublicThread = async (postId: string, page: number) => {
  "use cache";
  cacheLife("minutes");
  cacheTag(`comments-${postId}`);
  const rows = await db
    .select(fields)
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(comments.postId, postId), isNull(comments.parentCommentId)))
    .orderBy(desc(comments.score), asc(comments.createdAt), asc(comments.id))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  const parents = rows.slice(0, PAGE_SIZE);
  const replies =
    parents.length > 0
      ? await db
          .select(fields)
          .from(comments)
          .innerJoin(users, eq(comments.authorId, users.id))
          .where(
            and(
              eq(comments.postId, postId),
              inArray(
                comments.parentCommentId,
                parents.map(({ id }) => id)
              )
            )
          )
          .orderBy(asc(comments.createdAt), asc(comments.id))
      : [];
  return {
    comments: parents.map((comment) => ({
      ...comment,
      replies: replies.filter((reply) => reply.parentCommentId === comment.id),
    })),
    hasNext: rows.length > PAGE_SIZE,
  };
};

export type ThreadComment = Awaited<
  ReturnType<typeof getPublicThread>
>["comments"][number];
