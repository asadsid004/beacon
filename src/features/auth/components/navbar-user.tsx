import Link from "next/link";

import { getCurrentUser } from "../queries";
import { UserMenu } from "./user-menu";

const numberFormat = new Intl.NumberFormat("en-US");

// Async Server Component: resolves the session inside the navbar's Suspense slot.
// oxlint-disable-next-line react-doctor/only-export-components
export const NavbarUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex w-28 shrink-0 items-center justify-end gap-2 text-xs sm:w-40 sm:gap-3 sm:text-sm">
        <Link
          href="/login"
          className="focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring rounded-md px-2 py-2 font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-3"
        >
          Sign up
        </Link>
      </div>
    );
  }
  return (
    <div className="flex w-28 shrink-0 items-center justify-end gap-2 sm:w-40 sm:gap-3">
      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {numberFormat.format(user.karma)}
        <span className="sr-only"> karma</span>
      </span>
      <UserMenu username={user.username ?? user.name} />
    </div>
  );
};

export const NavbarUserSkeleton = () => (
  <div
    aria-hidden="true"
    className="flex w-28 shrink-0 items-center justify-end gap-2 sm:w-40 sm:gap-3"
  >
    <div className="bg-muted h-4 w-12 rounded-sm motion-safe:animate-pulse" />
    <div className="bg-muted size-8 rounded-full motion-safe:animate-pulse" />
  </div>
);
