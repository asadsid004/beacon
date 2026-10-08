import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { PostDate } from "@/components/post-date";
import { cn } from "@/lib/utils";

import type { FeedPost } from "../queries";

const numberFormat = new Intl.NumberFormat("en-US");
const pluralRules = new Intl.PluralRules("en-US");
const externalRel = "noopener noreferrer nofollow ugc";
const stretchedLink =
  "outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2";
const raisedLink =
  "relative z-10 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const PostCard = ({ post }: { post: FeedPost }) => {
  const href = `/p/${post.id}`;
  const hostname = post.url
    ? URL.parse(post.url)?.hostname.replace(/^www\./u, "")
    : null;
  const comments = `${numberFormat.format(post.commentCount)} ${pluralRules.select(post.commentCount) === "one" ? "comment" : "comments"}`;

  return (
    <article className="bg-card text-card-foreground hover:bg-accent/40 relative rounded-lg border p-4 sm:p-5">
      <h2 className="text-base leading-snug font-medium wrap-anywhere sm:text-lg">
        {post.url ? (
          <a
            className={cn(raisedLink, "underline-offset-4 hover:underline")}
            href={post.url}
            target="_blank"
            rel={externalRel}
          >
            {post.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link className={stretchedLink} href={href} prefetch={true}>
            {post.title}
          </Link>
        )}
      </h2>
      {post.url && hostname && (
        <a
          className={cn(
            raisedLink,
            "bg-muted text-muted-foreground hover:text-foreground mt-2 inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-xs"
          )}
          href={post.url}
          target="_blank"
          rel={externalRel}
          aria-label={`${hostname} (opens in a new tab)`}
        >
          <span className="min-w-0 wrap-anywhere">{hostname}</span>
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={12}
            aria-hidden="true"
            className="shrink-0"
          />
        </a>
      )}
      <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs leading-relaxed sm:text-sm">
        <span className="font-mono tabular-nums">
          {numberFormat.format(post.score)} points
        </span>
        {post.authorUsername ? (
          <Link
            className={cn(raisedLink, "hover:text-foreground")}
            href={`/u/${post.authorUsername}`}
          >
            {post.authorUsername}
          </Link>
        ) : (
          <span>[deleted]</span>
        )}
        <PostDate date={post.publishedAt} />
        <Link
          className={cn(
            post.url ? stretchedLink : raisedLink,
            "hover:text-foreground"
          )}
          href={href}
          prefetch={post.url ? true : undefined}
          aria-label={`Read ${comments} on ${post.title}`}
        >
          {comments}
        </Link>
        <Link
          className={cn(
            raisedLink,
            "bg-muted hover:text-foreground ml-auto rounded-md px-2 py-0.5"
          )}
          href={`/t/${post.tag}`}
        >
          {post.tag}
        </Link>
      </div>
    </article>
  );
};
