import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";

import { FEED_SORTS, getFeedHref } from "../feed-params";
import type { FeedSort } from "../feed-params";
import { getPublicFeed } from "../queries";
import { PostCard } from "./post-card";

const sortLabels = { hot: "Hot", new: "New", top: "Top" };

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
      <nav aria-label="Sort posts" className="mb-6 flex gap-1 border-b pb-3">
        {FEED_SORTS.map((value) => (
          <Button
            key={value}
            variant={sort === value ? "secondary" : "ghost"}
            size="lg"
            nativeButton={false}
            {...{ role: "link" }}
            render={
              <Link
                href={getFeedHref({ sort: value })}
                aria-current={sort === value ? "page" : undefined}
              />
            }
          >
            {sortLabels[value]}
          </Button>
        ))}
      </nav>
      {feed.posts.length > 0 ? (
        <div className="space-y-3">
          {feed.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border px-6 py-12 text-center">
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
      <div className="mb-6 flex gap-1 border-b pb-3">
        {FEED_SORTS.map((sort) => (
          <div key={sort} className="bg-muted h-9 w-12 rounded-md" />
        ))}
      </div>
      <div className="space-y-3">
        {["first", "second", "third", "fourth", "fifth"].map((key) => (
          <div key={key} className="rounded-lg border p-4 sm:p-5">
            <div className="bg-muted h-6 w-3/4 rounded-sm" />
            <div className="bg-muted mt-3 h-4 w-1/2 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
