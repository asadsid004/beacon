import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Feed, FeedSkeleton } from "@/features/posts/components/feed";
import { getFeedHref, parseFeedSort } from "@/features/posts/feed-params";
import { parsePage } from "@/lib/pagination";

const resolveHomeFeed = async (
  searchParams: PageProps<"/">["searchParams"]
) => {
  const params = await searchParams;
  const sort = parseFeedSort(params.sort);
  const page = parsePage(params.page);
  if (params.sort === "hot" || params.page === "1") {
    redirect(getFeedHref({ sort, page }));
  }
  return <Feed sort={sort} page={page} />;
};

const Home = ({ searchParams }: PageProps<"/">) => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
    <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
      Posts
    </h1>
    <Suspense fallback={<FeedSkeleton />}>
      {resolveHomeFeed(searchParams)}
    </Suspense>
  </main>
);

export default Home;
