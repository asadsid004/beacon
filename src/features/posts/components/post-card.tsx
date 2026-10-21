import { ArrowUpRight01Icon, Comment03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Suspense } from "react";

import { PostDate } from "@/components/post-date";
import { VotePlaceholder } from "@/components/vote-placeholder";
import type { getCurrentUser } from "@/features/auth/queries";
import { cn } from "@/lib/utils";

import type { FeedPost } from "../queries";
import { VisitorVote } from "./visitor-vote";

const numberFormat = new Intl.NumberFormat("en-US");
const pluralRules = new Intl.PluralRules("en-US");
const externalRel = "noopener noreferrer nofollow ugc";
const stretchedLink =
  "outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2";
const raisedLink =
  "relative z-10 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const PostCard = ({
  post,
  showAuthor = true,
  visitor,
}: {
  post: FeedPost;
  showAuthor?: boolean;
  visitor?: ReturnType<typeof getCurrentUser>;
}) => {
  const href = `/p/${post.id}`;
  const hostname = post.url
    ? URL.parse(post.url)?.hostname.replace(/^www\./u, "")
    : null;
  const comments = `${numberFormat.format(post.commentCount)} ${pluralRules.select(post.commentCount) === "one" ? "comment" : "comments"}`;

  return (
    <article className="text-foreground hover:bg-muted/50 relative -mx-3 flex items-start gap-3 rounded-lg px-3 py-2 transition-colors sm:gap-4">
      <div className="relative z-10 flex w-12 shrink-0 flex-col items-center gap-1">
        {visitor ? (
          <Suspense
            fallback={
              <VotePlaceholder
                score={post.score}
                label={post.title}
                visitor="pending"
              />
            }
          >
            <VisitorVote
              visitor={visitor}
              score={post.score}
              label={post.title}
            />
          </Suspense>
        ) : (
          <VotePlaceholder score={post.score} label={post.title} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="leading-normal">
          <h2 className="inline text-lg leading-normal font-medium wrap-anywhere">
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
                "text-muted-foreground hover:text-foreground ml-2 inline-flex max-w-full items-center gap-1 align-baseline text-sm"
              )}
              href={post.url}
              target="_blank"
              rel={externalRel}
              aria-label={`${hostname} (opens in a new tab)`}
            >
              <span aria-hidden="true">(</span>
              <span className="min-w-0 wrap-anywhere">{hostname}</span>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={12}
                strokeWidth={2}
                aria-hidden="true"
                className="shrink-0"
              />
              <span aria-hidden="true">)</span>
            </a>
          )}
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-normal">
          {showAuthor && (
            <span>
              by{" "}
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
            </span>
          )}
          <PostDate date={post.publishedAt} />
          <Link
            className={cn(
              post.url ? stretchedLink : raisedLink,
              "hover:text-foreground inline-flex items-center gap-1"
            )}
            href={href}
            prefetch={post.url ? true : undefined}
            aria-label={`Read ${comments} on ${post.title}`}
          >
            <HugeiconsIcon
              icon={Comment03Icon}
              strokeWidth={2}
              size={16}
              aria-hidden="true"
            />
            {comments}
          </Link>
          <Link
            className={cn(
              raisedLink,
              "hover:text-foreground bg-muted rounded-md px-2 py-1 text-xs"
            )}
            href={`/t/${post.tag}`}
          >
            #{post.tag}
          </Link>
        </div>
      </div>
    </article>
  );
};
