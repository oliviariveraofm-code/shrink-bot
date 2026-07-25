# The Trading Floor — Member Platform

Next.js app for authenticated member features (auth, dashboard, chart
upload + analysis, The Shrink). This is a **separate deployment** from
the marketing site at the repo root (`../index.html`, deployed to
GitHub Pages) — this app deploys to its own Vercel project. See
"Two separate deployments" below.

## What you'll eventually need to supply

Nothing below is required to keep developing -- the app runs and
builds fine against placeholders, falling back to mock behavior
wherever a real credential is missing. This list exists so going live
later is one checklist, not a scavenger hunt through every file.

| # | What | Where to get it | Used for | Required to go live? |
|---|------|------------------|----------|----------------------|
| 1 | Supabase project URL + anon key | supabase.com → your project → Project Settings → API | Auth, database, storage | **Yes** — nothing works live without this |
| 2 | Run `supabase/migrations/0001_init.sql` then `0002_mock_analysis.sql` | Supabase SQL Editor, against your project | Creates the tables/bucket/RLS the app expects | **Yes** |
| 3 | Vercel project, connected to this repo | vercel.com → New Project | Actually hosting this app at a real URL | **Yes** |
| 4 | The two Supabase values from #1, set as env vars in Vercel | Vercel → Project Settings → Environment Variables | Same as #1, but for the deployed app | **Yes** |
| 5 | `ANTHROPIC_API_KEY` | console.anthropic.com | Real AI chart analysis | **No** — without it, uploads still work and get a clearly-labeled mock result instead |
| 6 | Update the marketing site's "Log In" link | `../index.html`, the `data-placeholder="PLATFORM_APP_LOGIN_URL"` nav link | Points visitors from the marketing site to this app | **No**, but it's a dead link until you do |

## What's real vs. mock

- **Real:** Supabase email/password auth, session handling, protected
  routes, chart upload to Supabase Storage, per-user Row Level Security.
- **Conditionally real, mock fallback:** chart analysis
  (`lib/ai/analyzeChart.ts`) uses real Claude vision analysis if
  `ANTHROPIC_API_KEY` is configured, otherwise silently falls back to
  the mock generator (`lib/mock.ts`) -- either way the result is clearly
  labeled in the UI (`AI ANALYSIS` vs `MOCK ANALYSIS` badge on the
  TradeCard, driven by the `source` column on `chart_analyses`).
- **Mock, no real version built yet:** all stats on `/shrink`
  (`MOCK DATA` badge). Real behavioral tracking is a future phase.

## One-time setup (required before this app can run for real)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a project (free tier).
2. In **Project Settings → API**, copy the **Project URL** and the
   **anon / public key**.
3. In the SQL Editor, run both files in `supabase/migrations/`, in
   order: `0001_init.sql` (the `charts` table, the `chart-uploads`
   storage bucket, and their Row Level Security policies) and then
   `0002_mock_analysis.sql` (the `chart_analyses` table -- required
   before uploading a chart will work, since the upload flow writes a
   result to it immediately, mock or real).
4. In **Authentication → Providers**, email/password is enabled by
   default. Decide whether to require email confirmation (Authentication
   → Settings) — the signup flow here handles both cases.

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

The two `NEXT_PUBLIC_SUPABASE_*` values are required. `ANTHROPIC_API_KEY`
is optional -- leave it as the placeholder and chart uploads will use
the mock analysis generator instead of failing.

For production, set the same variables in Vercel: **Project Settings →
Environment Variables**.

### 3. Connect Vercel

1. Import this GitHub repo into a new Vercel project.
2. Leave **Root Directory** at its default (repo root) -- don't set it
   to `platform`. The root-level `vercel.json` already tells Vercel
   this is a monorepo with the Next.js app in `platform/` (via
   `installCommand`/`buildCommand`/`outputDirectory`), so it doesn't
   depend on that dashboard setting being found and configured by hand.
3. Add the environment variables from step 2.
4. Deploy. Every push to `claude/onyx-hero` will auto-deploy.

If a deployment fails immediately (a few seconds, before any real
build output), check that Root Directory in Project Settings is
genuinely unset/default -- if someone previously set it to `platform`,
that now conflicts with vercel.json's own paths (which are relative to
the repo root) and needs to be cleared.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Works with just
`.env.local`'s two Supabase values -- `ANTHROPIC_API_KEY` is optional
even locally, same mock fallback applies.

## Two separate deployments

- **GitHub Pages** (`../index.html` at repo root): the public marketing
  site. Unchanged by this app.
- **Vercel** (`platform/`, this app): auth, dashboard, upload, analysis,
  The Shrink. A different domain from the marketing site.

The marketing site's nav has a "Log In" link pointing at this app --
its `href` is a placeholder (`data-placeholder="PLATFORM_APP_LOGIN_URL"`)
until a real Vercel URL exists, at which point it should be updated to
point at `<your-vercel-url>/login`.

## Route map

| Route        | Access     | Status |
|--------------|------------|--------|
| `/`          | public     | redirects to `/dashboard` or `/login` |
| `/login`     | public     | real Supabase auth, redirects away if already logged in |
| `/signup`    | public     | real Supabase auth, redirects away if already logged in |
| `/dashboard` | protected  | real: chart list, upload |
| `/dashboard/charts/[id]` | protected | real chart + analysis (real AI or mock, clearly labeled) |
| `/shrink`    | protected  | mock stats, clearly labeled |

## CI

`.github/workflows/platform-ci.yml` runs `npm run lint` and `npm run
build` on every push/PR that touches `platform/**`, using dummy
Supabase env vars -- it only needs to prove the app compiles and
type-checks, not that it can reach a real project. Separate from
`deploy-onyx.yml`, which only cares about the marketing site.

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
  control, not the key's secrecy. `ANTHROPIC_API_KEY` is a real secret
  by contrast -- server-only, never sent to the browser, only read
  inside `lib/ai/analyzeChart.ts` (marked `server-only`).
- Chart uploads go through one Server Action end-to-end (upload +
  insert + analysis) rather than a client-side Storage call, so the
  same request that's already re-verified via `requireUser()` handles
  the whole thing -- see `app/dashboard/actions.ts`.
