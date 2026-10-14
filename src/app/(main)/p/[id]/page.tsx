import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import {
  PostDetail,
  PostDetailSkeleton,
} from "@/features/posts/components/post-detail";

const resolvePost = async ({ params }: PageProps<"/p/[id]">) => {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetail id={id} />
      </Suspense>
    </main>
  );
};

const PostPage = (props: PageProps<"/p/[id]">) => resolvePost(props);
export default PostPage;
