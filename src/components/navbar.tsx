import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  NavbarUser,
  NavbarUserSkeleton,
} from "@/features/auth/components/navbar-user";

const links = [
  { label: "Hot", href: "/" },
  { label: "New", href: "/?sort=new" },
  { label: "Top", href: "/?sort=top" },
  { label: "Tags", href: "/tags" },
];

export const Navbar = () => (
  <header className="bg-background border-border h-14 shrink-0 border-b">
    <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-6">
        <Link
          href="/"
          aria-label="Beacon home"
          className="font-heading text-primary focus-visible:ring-ring shrink-0 rounded-sm text-lg font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:text-2xl"
        >
          Beacon
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-0.5 sm:gap-2"
        >
          {links.map(({ label, href }) => (
            <Button
              key={label}
              variant="ghost"
              size="lg"
              nativeButton={false}
              {...{ role: "link" }}
              render={<Link href={href} />}
            >
              {label}
            </Button>
          ))}
        </nav>
      </div>
      <Suspense fallback={<NavbarUserSkeleton />}>
        <NavbarUser />
      </Suspense>
    </div>
  </header>
);
