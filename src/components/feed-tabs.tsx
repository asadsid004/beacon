"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { parseFeedSort, getFeedHref } from "@/features/posts/feed-params";
import { cn } from "@/lib/utils";

const links = [
  { label: "Hot", sort: "hot" },
  { label: "New", sort: "new" },
  { label: "Top", sort: "top" },
  { label: "Tags", sort: undefined },
] as const;

export const FeedTabs = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = parseFeedSort(searchParams.get("sort") ?? undefined);

  return (
    <nav aria-label="Main navigation" className={className}>
      <ul className="scrollbar-hidden -ml-3 flex h-11 overflow-x-auto md:ml-0 md:h-full md:overflow-visible">
        {links.map((link) => {
          const active = link.sort
            ? pathname === "/" && sort === link.sort
            : pathname === "/tags";
          return (
            <li key={link.label} className="h-full shrink-0">
              <Link
                href={link.sort ? getFeedHref({ sort: link.sort }) : "/tags"}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring relative inline-flex h-full shrink-0 items-center px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset",
                  active
                    ? "text-foreground after:bg-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full md:after:-bottom-px"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const FeedTabsSkeleton = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={className}>
    <div className="scrollbar-hidden -ml-3 flex h-11 overflow-x-auto md:ml-0 md:h-full md:overflow-visible">
      {links.map((link) => (
        <span
          key={link.label}
          className="invisible inline-flex h-full shrink-0 items-center px-3 text-sm font-medium whitespace-nowrap"
        >
          {link.label}
        </span>
      ))}
    </div>
  </div>
);
