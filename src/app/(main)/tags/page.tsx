import { Suspense } from "react";

import {
  PopularTags,
  PopularTagsSkeleton,
} from "@/features/posts/components/popular-tags";

const TagsPage = () => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
    <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
      Popular tags
    </h1>
    <Suspense fallback={<PopularTagsSkeleton />}>
      <PopularTags />
    </Suspense>
  </main>
);

export default TagsPage;
