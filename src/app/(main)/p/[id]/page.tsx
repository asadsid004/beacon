import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import {
  CommentThread,
  CommentThreadSkeleton,
} from "@/features/comments/components/comment-thread";
import {
  PostDetail,
  PostDetailSkeleton,
} from "@/features/posts/components/post-detail";
import { parsePage } from "@/lib/pagination";

const resolvePost = async ({ params, searchParams }: PageProps<"/p/[id]">) => {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }
  const hint = z.uuid().safeParse(search.comment).data;
  return (
    <>
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetail id={id} />
      </Suspense>
      <section aria-labelledby="comments-heading" className="mt-10">
        <h2
          id="comments-heading"
          className="font-heading mb-6 text-xl font-semibold tracking-tight"
        >
          Comments
        </h2>
        <Suspense fallback={<CommentThreadSkeleton />}>
          <CommentThread
            postId={id}
            page={parsePage(search.page)}
            commentId={hint}
            explicitFirstPage={search.page === "1"}
          />
        </Suspense>
      </section>
    </>
  );
};

const PostPage = (props: PageProps<"/p/[id]">) => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
    <Suspense fallback={<PostDetailSkeleton />}>{resolvePost(props)}</Suspense>
  </main>
);
export default PostPage;
