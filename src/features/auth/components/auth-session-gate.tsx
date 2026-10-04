import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/lib/auth";

interface AuthSessionGateProps {
  children: ReactNode;
}

// Async Server Component: reads the session and redirects signed-in users.
// oxlint-disable-next-line react-doctor/only-export-components
export const AuthSessionGate = async ({ children }: AuthSessionGateProps) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }

  return children;
};

export const AuthFormSkeleton = () => (
  <div
    aria-hidden="true"
    className="mx-auto my-auto w-full max-w-sm animate-pulse py-8"
  >
    <div className="bg-muted mb-6 h-20 rounded-xl" />
    <div className="bg-muted mb-3 h-11 rounded-xl" />
    <div className="bg-muted mb-3 h-11 rounded-xl" />
    <div className="bg-muted h-11 rounded-xl" />
  </div>
);
