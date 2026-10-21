import "server-only";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  getPublicAuthorHistory,
  getPublicAuthorPostCount,
} from "@/features/posts/queries";

const getPublicAuthor = async (username: string) => {
  const [author] = await db
    .select({
      id: users.id,
      username: users.username,
      karma: users.karma,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return author ?? null;
};

export const getPublicProfile = async (username: string, page: number) => {
  const author = await getPublicAuthor(username);
  if (!author) {
    return null;
  }
  const [feed, postCount] = await Promise.all([
    getPublicAuthorHistory(author.id, page),
    getPublicAuthorPostCount(author.id),
  ]);
  return { author, feed, postCount };
};
