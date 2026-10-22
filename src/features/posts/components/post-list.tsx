import type { getCurrentUser } from "@/features/auth/queries";

import type { FeedPost } from "../queries";
import { PostCard } from "./post-card";

export const PostList = ({
  posts,
  showAuthor = true,
  visitor,
}: {
  posts: FeedPost[];
  showAuthor?: boolean;
  visitor?: ReturnType<typeof getCurrentUser>;
}) => (
  <div className="space-y-6">
    {posts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        showAuthor={showAuthor}
        visitor={visitor}
      />
    ))}
  </div>
);
