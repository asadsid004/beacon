import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Pagination } from "@/components/pagination";

import { getFeedHref } from "../feed-params";
import type { FeedSort } from "../feed-params";
import { getPublicFeed } from "../queries";
import { PostCard } from "./post-card";

export const Feed = async ({
  sort,
  page,
}: {
  sort: FeedSort;
  page: number;
}) => {
  await connection();
  const feed = await getPublicFeed({ sort, page });
  if (page > 1 && feed.posts.length === 0) {
    notFound();
  }
  return (
    <>
      {feed.posts.length > 0 ? (
        <div className="space-y-6">
          {feed.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <h2 className="font-heading text-lg font-semibold">No posts yet</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Published posts will appear here.
          </p>
        </div>
      )}
      <Pagination
        previousHref={
          page > 1 ? getFeedHref({ sort, page: page - 1 }) : undefined
        }
        nextHref={
          feed.hasNext ? getFeedHref({ sort, page: page + 1 }) : undefined
        }
      />
    </>
  );
};

export const FeedSkeleton = () => (
  <div>
    <output className="sr-only">Loading posts…</output>
    <div aria-hidden="true" className="motion-safe:animate-pulse">
      <div className="space-y-6">
        {["first", "second", "third", "fourth", "fifth"].map((key) => (
          <div key={key} className="flex gap-3 sm:gap-4">
            <div className="flex w-12 shrink-0 flex-col items-center gap-1">
              <div className="bg-muted h-14 w-12 rounded-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="bg-muted h-6 w-3/4 rounded-sm" />
              <div className="bg-muted mt-1 h-6 w-1/2 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
