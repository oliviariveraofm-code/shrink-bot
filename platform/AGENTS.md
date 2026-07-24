<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# The Trading Floor — Member Platform

`middleware.ts` was renamed to `proxy.ts` in this Next.js version
(function name `proxy`, not `middleware`) -- this bit us once already
while building this app, confirmed via `node_modules/next/dist/docs/`.

Auth: Supabase (`@supabase/ssr`), never hand-rolled. See `lib/supabase/`,
`lib/auth.ts`, `proxy.ts`. Every protected page/Server Action re-checks
auth independently (see `README.md` security notes) -- don't rely on
`proxy.ts` alone when adding new protected routes.

Design system: reuse the classes in `app/globals.css` (ported from the
marketing site's Onyx system) -- don't introduce new colors, fonts, or
component patterns.
