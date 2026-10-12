import Link from "next/link";
import { connection } from "next/server";

import { getFeedHref } from "../feed-params";
import { getPopularTags } from "../queries";

const numberFormat = new Intl.NumberFormat("en-US");

export const PopularTags = async () => {
  await connection();
  const tags = await getPopularTags();
  if (tags.length === 0) {
    return (
      <p className="text-muted-foreground">
        Tags appear when posts are published.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map(({ tag, postCount }) => (
        <li key={tag}>
          <Link
            href={getFeedHref({ tag })}
            className="bg-muted hover:bg-primary/10 hover:text-primary focus-visible:ring-ring flex items-center justify-between gap-3 rounded-lg px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="min-w-0 font-medium wrap-anywhere">#{tag}</span>
            <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
              {numberFormat.format(postCount)}{" "}
              {postCount === 1 ? "post" : "posts"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export const PopularTagsSkeleton = () => (
  <div>
    <output className="sr-only">Loading tags…</output>
    <div
      aria-hidden="true"
      className="grid gap-3 motion-safe:animate-pulse sm:grid-cols-2 lg:grid-cols-3"
    >
      {["first", "second", "third", "fourth", "fifth", "sixth"].map((key) => (
        <div key={key} className="bg-muted h-12 rounded-lg" />
      ))}
    </div>
  </div>
);
