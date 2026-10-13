import type { FeedPost } from "../queries";
import { PostCard } from "./post-card";

export const PostList = ({
  posts,
  showAuthor = true,
}: {
  posts: FeedPost[];
  showAuthor?: boolean;
}) => (
  <div className="space-y-6">
    {posts.map((post) => (
      <PostCard key={post.id} post={post} showAuthor={showAuthor} />
    ))}
  </div>
);
