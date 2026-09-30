"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAppForm } from "@/hooks/use-app-form";
import { authClient } from "@/lib/auth-client";

import { signupSchema } from "../validations";

export const SignupForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const normalizedUsername = value.username.trim().toLowerCase();
      const normalizedEmail = value.email.trim().toLowerCase();

      const { error } = await authClient.signUp.email({
        email: normalizedEmail,
        password: value.password,
        name: normalizedUsername,
        username: normalizedUsername,
      });

      if (error) {
        setServerError(error.message || "Failed to create account");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    },
  });

  return (
    <div className="mx-auto my-auto w-full max-w-sm py-8">
      <div className="mb-8">
        <h1 className="font-heading text-foreground text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm text-balance">
          Join Beacon to post, comment, and bookmark threads
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
        <form.AppField name="username">
          {(field) => (
            <field.Input
              placeholder="Username"
              aria-label="Username"
              autoComplete="username"
              autoLowercase
              autoFocus
            />
          )}
        </form.AppField>

        <form.AppField name="email">
          {(field) => (
            <field.Input
              type="email"
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
            />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <field.PasswordInput
              placeholder="Password"
              aria-label="Password"
              autoComplete="new-password"
            />
          )}
        </form.AppField>

        <form.AppForm>
          <form.SubmitButton className="mt-2">Create account</form.SubmitButton>
        </form.AppForm>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
