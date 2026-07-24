import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Creates a NEW client per call -- never cache/share this
 * across requests (per @supabase/ssr's own guidance).
 *
 * `setAll` can fail here (e.g. when called from a Server Component render,
 * which cannot set cookies) -- that's expected and handled by proxy.ts
 * refreshing the session on every request instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component -- cookies can't be set here.
            // Session refresh is handled by proxy.ts on every request.
          }
        },
      },
    }
  );
}
