import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Defense-in-depth auth check for protected pages and Server Actions.
 * proxy.ts redirects unauthenticated requests too, but per Next.js's own
 * guidance, Proxy coverage can silently be missed by a matcher change or a
 * refactor -- every protected page and every Server Action re-verifies here.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
