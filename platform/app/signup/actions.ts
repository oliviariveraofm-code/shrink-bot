"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthFormSchema, type AuthFormState } from "@/lib/definitions";

export async function signup(
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
  const { data, error } = await supabase.auth.signUp(validated.data);

  if (error) {
    return { error: error.message };
  }

  // Email confirmation may be required depending on the Supabase project's
  // Auth settings. If a session comes back immediately, confirmation is off
  // and the user is already logged in -- send them straight to the dashboard.
  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?confirm=1");
}
