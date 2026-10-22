import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PostDate } from "@/components/post-date";
import { VotePlaceholder } from "@/components/vote-placeholder";
import { getCurrentUser } from "@/features/auth/queries";

import { getPublicPost } from "../queries";
import { PostImage } from "./post-image";
import { PostMarkdown } from "./post-markdown";
import { VisitorVote } from "./visitor-vote";

const numberFormat = new Intl.NumberFormat("en-US");
const externalRel = "noopener noreferrer nofollow ugc";
const linkStyle =
  "hover:text-foreground focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const PostDetail = async ({ id }: { id: string }) => {
  const post = await getPublicPost(id);
  if (!post) {
    notFound();
  }
  return (
    <article>
      <header className="mb-8 flex items-start gap-3 sm:gap-4">
        <div className="w-12 shrink-0">
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
              visitor={getCurrentUser()}
              score={post.score}
              label={post.title}
            />
          </Suspense>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl leading-snug font-semibold tracking-tight wrap-anywhere sm:text-3xl">
            {post.url ? (
              <a
                href={post.url}
                target="_blank"
                rel={externalRel}
                className="focus-visible:ring-ring rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2"
              >
                {post.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              post.title
            )}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-sm">
            <span>
              by{" "}
              {post.authorUsername ? (
                <Link href={`/u/${post.authorUsername}`} className={linkStyle}>
                  {post.authorUsername}
                </Link>
              ) : (
                "[deleted]"
              )}
            </span>
            <PostDate date={post.publishedAt} />
            <span>
              {numberFormat.format(post.commentCount)}{" "}
              {post.commentCount === 1 ? "comment" : "comments"}
            </span>
            <Link
              href={`/t/${post.tag}`}
              className={`${linkStyle} bg-muted px-2 py-1 text-xs`}
            >
              #{post.tag}
            </Link>
          </div>
        </div>
      </header>
      {!post.deletedAt && post.headerImageUrl && (
        <PostImage key={post.headerImageUrl} src={post.headerImageUrl} />
      )}
      {post.deletedAt ? (
        <p className="text-muted-foreground">
          This post was deleted by the author.
        </p>
      ) : (
        post.body && <PostMarkdown body={post.body} />
      )}
    </article>
  );
};

export const PostDetailSkeleton = () => (
  <div>
    <output className="sr-only">Loading post…</output>
    <div aria-hidden="true" className="motion-safe:animate-pulse">
      <div className="bg-muted h-9 w-3/4 rounded-sm" />
      <div className="bg-muted mt-3 h-5 w-1/2 rounded-sm" />
      <div className="mt-8 space-y-3">
        <div className="bg-muted h-4 w-full rounded-sm" />
        <div className="bg-muted h-4 w-5/6 rounded-sm" />
        <div className="bg-muted h-4 w-2/3 rounded-sm" />
      </div>
    </div>
  </div>
);
