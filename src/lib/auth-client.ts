import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { normalizeUsername } from "@/features/auth/constants";
import type { LoginInput, SignupInput } from "@/features/auth/validations";

export const authClient = createAuthClient({
  plugins: [usernameClient()],
});

export const login = ({ identifier, password }: LoginInput) => {
  const normalized = normalizeUsername(identifier);
  const isEmail = normalized.includes("@");

  if (isEmail) {
    return authClient.signIn.email({
      email: normalized,
      password,
    });
  }

  return authClient.signIn.username({
    username: normalized,
    password,
  });
};

export const signUp = ({ username, email, password }: SignupInput) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = email.trim().toLowerCase();

  return authClient.signUp.email({
    email: normalizedEmail,
    password,
    name: normalizedUsername,
    username: normalizedUsername,
  });
};
