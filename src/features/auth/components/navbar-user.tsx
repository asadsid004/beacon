import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getCurrentUser } from "../queries";
import { UserMenu } from "./user-menu";

const numberFormat = new Intl.NumberFormat("en-US");

export const NavbarUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex shrink-0 items-center justify-end gap-2 text-xs sm:gap-3 sm:text-sm">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          {...{ role: "link" }}
          render={<Link href="/login" />}
        >
          Log in
        </Button>
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
    <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
      <span className="text-muted-foreground text-xs">
        <span className="font-mono tabular-nums">
          {numberFormat.format(user.karma)}
        </span>{" "}
        karma
      </span>
      <UserMenu username={user.username ?? user.name} />
    </div>
  );
};

export const NavbarUserSkeleton = () => (
  <div
    aria-hidden="true"
    className="flex shrink-0 items-center justify-end gap-2 sm:gap-3"
  >
    <div className="bg-muted h-4 w-12 rounded-sm motion-safe:animate-pulse" />
    <div className="bg-muted size-8 rounded-full motion-safe:animate-pulse" />
  </div>
);
