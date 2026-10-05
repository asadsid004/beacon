import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  AuthFormSkeleton,
  AuthSessionGate,
} from "@/features/auth/components/auth-session-gate";
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Beacon account.",
};

const currentYear = new Date().getFullYear();

const SignupPage = () => (
  <>
    <header className="flex items-center justify-between">
      <Link
        href="/"
        className="font-heading text-primary text-3xl font-semibold tracking-tight"
      >
        Beacon
      </Link>
      <Suspense
        fallback={
          <span className="text-muted-foreground text-sm font-medium">
            Login
          </span>
        }
      >
        <AuthSwitchLink href="/login">Login</AuthSwitchLink>
      </Suspense>
    </header>

    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthSessionGate>
        <SignupForm />
      </AuthSessionGate>
    </Suspense>

    <footer className="text-muted-foreground text-xs">
      &copy; {currentYear} Beacon
    </footer>
  </>
);

export default SignupPage;
