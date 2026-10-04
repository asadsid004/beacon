"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { getSafeReturnTo } from "@/features/auth/return-to";
import { loginSchema } from "@/features/auth/validations";
import { useAppForm } from "@/hooks/use-app-form";
import { login } from "@/lib/auth-client";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      const { error } = await login({
        identifier: value.identifier,
        password: value.password,
      });

      if (error) {
        setServerError(error.message || "Invalid credentials");
        return;
      }

      router.push(returnTo);
      router.refresh();
    },
  });

  return (
    <div className="mx-auto my-auto w-full max-w-sm py-8">
      <div className="mb-6">
        <h1 className="font-heading text-foreground text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Login to your account with your username or email
        </p>
      </div>

      {serverError ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-xl border px-3.5 py-2.5 text-sm"
        >
          {serverError}
        </div>
      ) : null}

      <form
        action={() => {
          form.handleSubmit();
        }}
        className="space-y-3"
      >
        <form.AppField name="identifier">
          {(field) => (
            <field.Input
              placeholder="Username or email"
              aria-label="Username or email"
              autoComplete="username"
            />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <field.PasswordInput
              placeholder="Password"
              aria-label="Password"
              autoComplete="current-password"
            />
          )}
        </form.AppField>

        <form.AppForm>
          <form.SubmitButton className="mt-2">Login</form.SubmitButton>
        </form.AppForm>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};
