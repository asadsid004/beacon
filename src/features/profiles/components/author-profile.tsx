import { notFound } from "next/navigation";

import { Pagination } from "@/components/pagination";
import { FeedSkeleton } from "@/features/posts/components/feed";
import { PostList } from "@/features/posts/components/post-list";

import { getProfileHref } from "../profile-params";
import { getPublicProfile } from "../queries";

const numberFormat = new Intl.NumberFormat("en-US");
const joinedFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const AuthorProfile = async ({
  username,
  page,
}: {
  username: string;
  page: number;
}) => {
  const profile = await getPublicProfile(username, page);
  if (!profile) {
    notFound();
  }
  const { author, feed, postCount } = profile;
  if (page > 1 && feed.posts.length === 0) {
    notFound();
  }
  return (
    <>
      <header className="flex items-start gap-4 pb-6">
        <span
          aria-hidden="true"
          className="bg-muted font-heading flex size-14 shrink-0 items-center justify-center rounded-full text-2xl font-medium"
        >
          {author.username?.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            @{author.username}
          </h1>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm leading-normal">
            <span>
              <span className="text-foreground font-mono tabular-nums">
                {numberFormat.format(author.karma)}
              </span>{" "}
              karma
            </span>
            <span>
              <span className="text-foreground font-mono tabular-nums">
                {numberFormat.format(postCount)}
              </span>{" "}
              {postCount === 1 ? "post" : "posts"}
            </span>
            <span>
              Joined{" "}
              <time dateTime={author.createdAt.toISOString()}>
                {joinedFormat.format(author.createdAt)}
              </time>
            </span>
          </div>
        </div>
      </header>
      <section aria-labelledby="author-posts-heading">
        <h2
          id="author-posts-heading"
          className="font-heading mb-4 text-xl font-semibold tracking-tight"
        >
          Posts
        </h2>
        {feed.posts.length > 0 ? (
          <PostList posts={feed.posts} showAuthor={false} />
        ) : (
          <p className="text-muted-foreground py-8">
            This author has no published posts yet.
          </p>
        )}
        <Pagination
          previousHref={
            page > 1 ? getProfileHref(username, page - 1) : undefined
          }
          nextHref={
            feed.hasNext ? getProfileHref(username, page + 1) : undefined
          }
        />
      </section>
    </>
  );
};

export const AuthorProfileSkeleton = () => (
  <div>
    <output className="sr-only">Loading author profile…</output>
    <div
      aria-hidden="true"
      className="flex items-start gap-4 pb-6 motion-safe:animate-pulse"
    >
      <div className="bg-muted size-14 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="bg-muted h-9 w-40 rounded-sm" />
        <div className="bg-muted mt-1 h-5 w-full max-w-sm rounded-sm" />
      </div>
    </div>
    <h2 className="font-heading mb-4 text-xl font-semibold tracking-tight">
      Posts
    </h2>
    <FeedSkeleton />
  </div>
);
