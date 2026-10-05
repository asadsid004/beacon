import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  AuthFormSkeleton,
  AuthSessionGate,
} from "@/features/auth/components/auth-session-gate";
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Beacon account.",
};

const currentYear = new Date().getFullYear();

const LoginPage = () => (
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
            Sign up
          </span>
        }
      >
        <AuthSwitchLink href="/signup">Sign up</AuthSwitchLink>
      </Suspense>
    </header>

    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthSessionGate>
        <LoginForm />
      </AuthSessionGate>
    </Suspense>

    <footer className="text-muted-foreground text-xs">
      &copy; {currentYear} Beacon
    </footer>
  </>
);

export default LoginPage;
