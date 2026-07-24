import * as z from "zod";

export const AuthFormSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." }),
});

export type AuthFormState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
} | null;
