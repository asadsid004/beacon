import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { Feed, FeedSkeleton } from "@/features/posts/components/feed";
import { getFeedHref } from "@/features/posts/feed-params";
import { parsePage } from "@/lib/pagination";

const resolveTagFeed = async ({
  params,
  searchParams,
}: PageProps<"/t/[tag]">) => {
  const [{ tag }, search] = await Promise.all([params, searchParams]);
  if (tag.length > 30 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(tag)) {
    notFound();
  }
  const page = parsePage(search.page);
  if (search.page === "1" || search.sort !== undefined) {
    redirect(getFeedHref({ tag, page }));
  }
  return (
    <>
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        #{tag}
      </h1>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed sort="hot" page={page} tag={tag} />
      </Suspense>
    </>
  );
};

const TagPage = (props: PageProps<"/t/[tag]">) => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
    <Suspense fallback={<FeedSkeleton />}>{resolveTagFeed(props)}</Suspense>
  </main>
);

export default TagPage;
