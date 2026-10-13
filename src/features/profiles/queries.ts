import "server-only";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export const getPublicAuthor = async (username: string) => {
  const [author] = await db
    .select({
      id: users.id,
      username: users.username,
      karma: users.karma,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);
  return author ?? null;
};
