import Link from "next/link";
import { Suspense } from "react";

import { FeedTabs, FeedTabsSkeleton } from "@/components/feed-tabs";
import {
  NavbarUser,
  NavbarUserSkeleton,
} from "@/features/auth/components/navbar-user";

export const Navbar = () => (
  <header className="bg-background border-border sticky top-0 z-40 shrink-0 border-b">
    <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center px-4 sm:px-6 md:h-14 md:flex-nowrap">
      <div className="mt-2 flex h-10 min-w-0 items-center md:h-14">
        <Link
          href="/"
          aria-label="Beacon home"
          className="font-heading text-primary focus-visible:ring-ring shrink-0 rounded-sm text-2xl font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:text-3xl"
        >
          Beacon
        </Link>
      </div>
      <div className="ml-auto flex h-10 items-center gap-2 md:order-2 md:ml-6 md:h-14">
        <Suspense fallback={<NavbarUserSkeleton />}>
          <NavbarUser />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <FeedTabsSkeleton className="w-full md:order-1 md:ml-auto md:h-full md:w-auto" />
        }
      >
        <FeedTabs className="w-full md:order-1 md:ml-auto md:h-full md:w-auto" />
      </Suspense>
    </div>
  </header>
);
