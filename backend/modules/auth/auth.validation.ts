import { z } from "zod";

export const signupSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores",
        ),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(128, "Password cannot exceed 128 characters"),
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username or email is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});