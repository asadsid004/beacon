import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Beacon account.",
};

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

    <SignupForm />

    <footer className="text-muted-foreground text-xs">
      &copy; {new Date().getFullYear()} Beacon
    </footer>
  </>
);

export default SignupPage;
