import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Beacon account.",
};

const LoginPage = () => (
  <>
    <header className="flex items-center justify-between">
      <Link
        href="/"
        className="font-heading text-primary text-3xl font-semibold tracking-tight"
      >
        Beacon
      </Link>
      <Link
        href="/signup"
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        Sign up
      </Link>
    </header>

    <LoginForm />

    <footer className="text-muted-foreground text-xs">
      &copy; {new Date().getFullYear()} Beacon
    </footer>
  </>
);

export default LoginPage;
