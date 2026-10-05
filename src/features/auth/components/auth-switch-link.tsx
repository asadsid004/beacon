"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { getSafeReturnTo } from "@/features/auth/return-to";

interface AuthSwitchLinkProps {
  href: "/login" | "/signup";
  children: ReactNode;
  className?: string;
}

export const AuthSwitchLink = ({
  href,
  children,
  className = "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors",
}: AuthSwitchLinkProps) => {
  const searchParams = useSearchParams();
  const value = searchParams.get("returnTo");
  const destination =
    value === null
      ? href
      : `${href}?returnTo=${encodeURIComponent(getSafeReturnTo(value))}`;

  return (
    <Link href={destination} className={className}>
      {children}
    </Link>
  );
};
