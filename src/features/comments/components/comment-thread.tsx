import { ArrowUp01Icon as ChevronUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CopyLinkButton } from "@/components/copy-link-button";
import { Pagination } from "@/components/pagination";
import { PostDate } from "@/components/post-date";
import { getPublicPost } from "@/features/posts/queries";

import { getCommentPage, getPublicThread } from "../queries";
import type { ThreadComment } from "../queries";
import { getThreadHref } from "../thread-params";
import { CommentAnchorFocus } from "./comment-anchor-focus";

const numberFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const linkStyle =
  "hover:text-foreground focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const Comment = ({
  comment,
  postId,
}: {
  comment: Omit<ThreadComment, "replies">;
  postId: string;
}) => (
  <article
    id={`comment-${comment.id}`}
    tabIndex={-1}
    className="focus-visible:ring-ring target:bg-muted/50 min-w-0 rounded-lg outline-none focus-visible:ring-2"
  >
    <div className="text-muted-foreground mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      {comment.username ? (
        <Link
          href={`/u/${comment.username}`}
          className={`${linkStyle} text-foreground font-medium`}
        >
          {comment.username}
        </Link>
      ) : (
        <span>[deleted]</span>
      )}
      <Link
        href={`/p/${postId}?comment=${comment.id}#comment-${comment.id}`}
        className={linkStyle}
        aria-label={`Permalink to comment by ${comment.username ?? "deleted author"}`}
      >
        <PostDate date={comment.createdAt} />
      </Link>
    </div>
    <p className="max-w-prose leading-6 wrap-anywhere whitespace-pre-wrap">
      {comment.body}
    </p>
    <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
      <button
        type="button"
        disabled
        aria-pressed={false}
        aria-label={`Upvote comment by ${comment.username ?? "deleted author"}, available in a later release`}
        className="hover:bg-muted aria-pressed:text-primary inline-flex min-h-8 items-center gap-1 rounded-sm px-1"
      >
        <HugeiconsIcon
          icon={ChevronUpIcon}
          className="size-4"
          aria-hidden="true"
        />
        <span className="font-mono tabular-nums">
          {numberFormat.format(comment.score)}
        </span>
      </button>
      {comment.parentCommentId === null && (
        <button
          type="button"
          disabled
          className="hover:text-foreground min-h-8"
        >
          Reply
        </button>
      )}
      <CopyLinkButton key={comment.id} commentId={comment.id} />
    </div>
  </article>
);

export const CommentThread = async ({
  postId,
  page,
  commentId,
  explicitFirstPage,
}: {
  postId: string;
  page: number;
  commentId?: string;
  explicitFirstPage: boolean;
}) => {
  const post = await getPublicPost(postId);
  if (!post) {
    notFound();
  }
  const locatedPage = commentId
    ? await getCommentPage(postId, commentId)
    : null;
  const currentPage = locatedPage ?? page;
  if (explicitFirstPage && locatedPage === null) {
    redirect(getThreadHref(postId));
  }
  const thread = await getPublicThread(postId, currentPage);
  if (currentPage > 1 && thread.comments.length === 0) {
    notFound();
  }
  return (
    <>
      {thread.comments.length === 0 ? (
        <p className="text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-6">
          {thread.comments.map((comment) => (
            <li key={comment.id}>
              <Comment comment={comment} postId={postId} />
              {comment.replies.length > 0 && (
                <ul className="border-border mt-3 space-y-4 border-l pl-4 sm:pl-6">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <Comment comment={reply} postId={postId} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      <Pagination
        previousHref={
          currentPage > 1 ? getThreadHref(postId, currentPage - 1) : undefined
        }
        nextHref={
          thread.hasNext ? getThreadHref(postId, currentPage + 1) : undefined
        }
      />
      <CommentAnchorFocus
        id={locatedPage === null ? undefined : commentId}
        postId={postId}
      />
    </>
  );
};

export const CommentThreadSkeleton = () => (
  <div>
    <output className="sr-only">Loading comments…</output>
    <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
      {["first", "second", "third"].map((key) => (
        <div key={key}>
          <div className="bg-muted mb-2 h-5 w-1/3 rounded-sm" />
          <div className="bg-muted h-6 w-2/3 rounded-sm" />
        </div>
      ))}
    </div>
  </div>
);
