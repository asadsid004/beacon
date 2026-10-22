import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import {
  AuthorProfile,
  AuthorProfileSkeleton,
} from "@/features/profiles/components/author-profile";
import { getProfileHref } from "@/features/profiles/profile-params";
import { parsePage } from "@/lib/pagination";

export const generateMetadata = async ({
  params,
}: PageProps<"/u/[username]">) => {
  const { username } = await params;
  return { title: username.toLowerCase() };
};

const resolveProfile = async ({
  params,
  searchParams,
}: PageProps<"/u/[username]">) => {
  const [{ username: routeUsername }, search] = await Promise.all([
    params,
    searchParams,
  ]);
  const username = routeUsername.toLowerCase();
  if (
    username.length < 3 ||
    username.length > 30 ||
    !/^[a-z0-9_-]+$/u.test(username)
  ) {
    notFound();
  }
  const page = parsePage(search.page);
  if (search.page === "1" || routeUsername !== username) {
    redirect(getProfileHref(username, page));
  }
  return <AuthorProfile username={username} page={page} />;
};

const ProfilePage = (props: PageProps<"/u/[username]">) => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
    <Suspense fallback={<AuthorProfileSkeleton />}>
      {resolveProfile(props)}
    </Suspense>
  </main>
);

export default ProfilePage;
