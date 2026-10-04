import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  AuthFormSkeleton,
  AuthSessionGate,
} from "@/features/auth/components/auth-session-gate";
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
      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        Login
      </Link>
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
