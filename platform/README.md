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
| 2 | Run `supabase/migrations/0001_init.sql`, `0002_mock_analysis.sql`, then `0003_shrink_chat.sql` | Supabase SQL Editor, against your project | Creates the tables/bucket/RLS the app expects | **Yes** |
| 3 | Vercel project, connected to this repo | vercel.com → New Project | Actually hosting this app at a real URL | **Yes** |
| 4 | The two Supabase values from #1, set as env vars in Vercel | Vercel → Project Settings → Environment Variables | Same as #1, but for the deployed app | **Yes** |
| 5 | `ANTHROPIC_API_KEY` | console.anthropic.com | Real AI chart analysis, and real Shrink chat replies | **No** — without it, uploads and Shrink chat still work and get a clearly-labeled mock result instead |
| 6 | ~~Update the marketing site's "Log In" link~~ | `../index.html` | Points visitors from the marketing site to this app | **Done** — points to `https://shrink-bot-ebon.vercel.app/login` |

## What's real vs. mock

- **Real:** Supabase email/password auth, session handling, protected
  routes, chart upload to Supabase Storage, per-user Row Level Security,
  the activity stats on the dashboard and the top half of `/shrink`
  (charts uploaded, direction bias, avg. confidence, most common setup --
  all computed from your actual `charts`/`chart_analyses` rows, `LIVE`
  badge).
- **Conditionally real, mock fallback:** chart analysis
  (`lib/ai/analyzeChart.ts`) and Shrink chat replies
  (`lib/ai/shrinkChat.ts`) both use real Claude if `ANTHROPIC_API_KEY` is
  configured, otherwise silently fall back to `lib/mock.ts` -- either way
  the result is clearly labeled in the UI (`AI ANALYSIS`/`MOCK ANALYSIS`
  badge on the TradeCard; `THE SHRINK — LIVE`/`MOCK REPLY` under each
  Shrink chat reply), driven by the `source` column on `chart_analyses`
  and `shrink_messages` respectively.
- **Mock, no real version built yet:** "Distance to prop-firm limits"
  and "Discipline score" on `/shrink` (`MOCK DATA` badge) -- both need
  real trade *outcome* tracking (win/loss, P&L), which isn't built. The
  Shrink chat is grounded only in upload/analysis activity, and is
  instructed to say so honestly if asked about win rate or profit.

## One-time setup (required before this app can run for real)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a project (free tier).
2. In **Project Settings → API**, copy the **Project URL** and the
   **anon / public key**.
3. In the SQL Editor, run all three files in `supabase/migrations/`, in
   order: `0001_init.sql` (the `charts` table, the `chart-uploads`
   storage bucket, and their Row Level Security policies), then
   `0002_mock_analysis.sql` (the `chart_analyses` table -- required
   before uploading a chart will work, since the upload flow writes a
   result to it immediately, mock or real), then `0003_shrink_chat.sql`
   (the `shrink_messages` table -- required before the Shrink chat will
   work).
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
2. In **Project Settings → General → Root Directory**, set it to
   `platform`. This is required, not optional -- Vercel's Next.js
   framework/version detection reads `package.json` at whatever Root
   Directory points to. There's no `package.json` at the repo root (this
   is a monorepo with the marketing site's static files there instead),
   so leaving Root Directory unset causes the build to fail with `No
   Next.js version detected` even though `next` is correctly listed in
   `platform/package.json`.
   - An earlier version of this repo tried to work around Root
     Directory entirely with a root-level `vercel.json`
     (`installCommand`/`buildCommand` that `cd platform`). That
     approach got past the "failing immediately" problem but doesn't
     satisfy Vercel's framework-detection step, which is why it's been
     removed -- Root Directory is the actual fix.
   - Once Root Directory is set to `platform`, no `vercel.json` is
     needed at all. Framework Preset should auto-detect as "Next.js" --
     worth a quick check in Project Settings → General if a deployment
     still fails at this step, in case it was previously locked to
     something else (or left as "Other") from before Root Directory was
     corrected.
3. Add the environment variables from step 2 above.
4. Deploy. Every push to `claude/onyx-hero` will auto-deploy.

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
its `href` is `https://shrink-bot-ebon.vercel.app/login`.

## Route map

| Route        | Access     | Status |
|--------------|------------|--------|
| `/`          | public     | redirects to `/dashboard` or `/login` |
| `/login`     | public     | real Supabase auth, redirects away if already logged in |
| `/signup`    | public     | real Supabase auth, redirects away if already logged in |
| `/dashboard` | protected  | real: chart list + activity stats, upload |
| `/dashboard/charts/[id]` | protected | real chart + analysis (real AI or mock, clearly labeled) |
| `/shrink`    | protected  | real activity stats + Shrink chat (real AI or mock, clearly labeled); outcome-based stats still mock |

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
