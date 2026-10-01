import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { LoginInput, SignupInput } from "@/features/auth/validations";

export const authClient = createAuthClient({
  plugins: [usernameClient()],
});

export const login = ({ identifier, password }: LoginInput) => {
  const normalized = identifier.trim().toLowerCase();
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
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  return authClient.signUp.email({
    email: normalizedEmail,
    password,
    name: normalizedUsername,
    username: normalizedUsername,
  });
};
