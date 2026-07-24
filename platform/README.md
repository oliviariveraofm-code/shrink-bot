# The Trading Floor — Member Platform

Next.js app for authenticated member features (auth, dashboard, chart
upload, mock analysis, The Shrink). This is a **separate deployment**
from the marketing site at the repo root (`../index.html`, deployed to
GitHub Pages) — this app deploys to its own Vercel project. See
"Two separate deployments" below.

## What's real vs. mock

- **Real:** Supabase email/password auth, session handling, protected
  routes, chart upload to Supabase Storage, per-user Row Level Security.
- **Mock (explicitly labeled in the UI):** the TradeCard analysis result
  shown after upload, and all stats on `/shrink`. No real chart-reading
  AI exists yet — that's a future phase.

## One-time setup (required before this app can run for real)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a project (free tier).
2. In **Project Settings → API**, copy the **Project URL** and the
   **anon / public key**.
3. In the SQL Editor, run `supabase/migrations/0001_init.sql` (in this
   repo) to create the `charts` table, the `chart-uploads` storage
   bucket, and their Row Level Security policies.
4. In **Authentication → Providers**, email/password is enabled by
   default. Decide whether to require email confirmation (Authentication
   → Settings) — the signup flow here handles both cases.

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the two values
from step 1:

```bash
cp .env.local.example .env.local
```

For production, set the same two variables in Vercel: **Project
Settings → Environment Variables**.

### 3. Connect Vercel

1. Import this GitHub repo into a new Vercel project.
2. Set **Root Directory** to `platform` (this is a monorepo-style
   layout — the marketing site lives at the repo root, this app lives
   in `platform/`).
3. Add the two environment variables from step 2.
4. Deploy. Every push to `claude/onyx-hero` will auto-deploy.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Two separate deployments

- **GitHub Pages** (`../index.html` at repo root): the public marketing
  site. Unchanged by this app.
- **Vercel** (`platform/`, this app): auth, dashboard, upload, mock
  analysis, The Shrink. A different domain from the marketing site.

The marketing site's nav has a "Log In" link pointing at this app --
its `href` is a placeholder (`data-placeholder="PLATFORM_APP_LOGIN_URL"`)
until a real Vercel URL exists, at which point it should be updated to
point at `<your-vercel-url>/login`.

## Route map

| Route        | Access     | Status |
|--------------|------------|--------|
| `/`          | public     | redirects to `/dashboard` or `/login` |
| `/login`     | public     | real Supabase auth |
| `/signup`    | public     | real Supabase auth |
| `/dashboard` | protected  | real: chart list, upload |
| `/shrink`    | protected  | mock stats, clearly labeled |

## Security notes

- Auth is handled entirely by Supabase (`@supabase/ssr`) -- no
  hand-rolled password storage.
- `proxy.ts` (Next.js 16's renamed `middleware.ts`) redirects
  unauthenticated requests away from `/dashboard` and `/shrink`, but
  it's not the only gate: every protected page and every Server Action
  independently re-checks the session (`lib/auth.ts`'s `requireUser()`),
  and the actual data access boundary is Supabase Row Level Security --
  see `supabase/migrations/0001_init.sql`.
- The Supabase anon key is safe to expose client-side (`NEXT_PUBLIC_*`).
  It is a public identifier, not a secret; RLS is what enforces access
  control, not the key's secrecy.
