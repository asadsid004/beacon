import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getCurrentUser } from "../queries";
import { UserMenu } from "./user-menu";

const numberFormat = new Intl.NumberFormat("en-US");

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
        <Button
          size="lg"
          nativeButton={false}
          {...{ role: "link" }}
          render={<Link href="/signup" />}
        >
          Sign up
        </Button>
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
