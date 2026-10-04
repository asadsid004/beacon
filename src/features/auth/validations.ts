import { z } from "zod";

import {
  isReservedUsername,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "./constants";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Username or email must be at least 3 characters")
    .max(255, "Username or email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(
      USERNAME_MIN_LENGTH,
      `Username must be at least ${USERNAME_MIN_LENGTH} characters`
    )
    .max(
      USERNAME_MAX_LENGTH,
      `Username must be at most ${USERNAME_MAX_LENGTH} characters`
    )
    .regex(
      USERNAME_REGEX,
      "Username can only contain lowercase letters, numbers, underscores, and hyphens"
    )
    .refine((value) => !isReservedUsername(value), {
      message: "This username is reserved",
    }),
  email: z
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
