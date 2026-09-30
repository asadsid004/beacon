import { z } from "zod";

export const USERNAME_REGEX = /^[a-z0-9_-]+$/u;

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
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      USERNAME_REGEX,
      "Username can only contain lowercase letters, numbers, underscores, and hyphens"
    ),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
