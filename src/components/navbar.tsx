import Link from "next/link";
import { Suspense } from "react";

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
          className="focus-visible:ring-ring flex shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground font-heading flex size-6 items-center justify-center rounded-md text-sm font-bold"
          >
            b
          </span>
          <span className="font-heading hidden text-lg font-semibold tracking-tight sm:inline">
            Beacon
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-0.5 sm:gap-2"
        >
          {links.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring rounded-md px-1.5 py-2 text-xs outline-none focus-visible:ring-2 sm:px-2 sm:text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <Suspense fallback={<NavbarUserSkeleton />}>
        <NavbarUser />
      </Suspense>
    </div>
  </header>
);
