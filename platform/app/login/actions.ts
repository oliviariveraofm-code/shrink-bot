"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthFormSchema, type AuthFormState } from "@/lib/definitions";

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validated = AuthFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  const next = (formData.get("next") as string) || "/dashboard";
  redirect(next.startsWith("/") ? next : "/dashboard");
}
