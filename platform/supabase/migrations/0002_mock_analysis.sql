-- Phase 3 Step 5 (updated when real AI analysis was added): analysis
-- results, linked 1:1 to a chart -- one row whether the analysis came
-- from the mock generator or real AI. Run after 0001_init.sql. Safe to
-- re-run (IF NOT EXISTS).
--
-- `source` says which: 'mock' (lib/mock.ts) or 'claude-vision'
-- (lib/ai/analyzeChart.ts, only runs if ANTHROPIC_API_KEY is configured).
-- The UI badge in components/TradeCard.tsx reads this column directly --
-- this table is the single source of truth for whether a given result
-- can be trusted as real, not a naming convention or a separate table.
--
-- (Filename kept as 0002_mock_analysis.sql rather than renamed, even
-- though the table itself is now called chart_analyses -- this migration
-- has never been run against a live project, so renaming the file would
-- just be churn with no live schema to reconcile.)

create table if not exists public.chart_analyses (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid not null unique references public.charts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'mock' check (source in ('mock', 'claude-vision')),
  pair text not null,
  direction text not null check (direction in ('LONG', 'SHORT')),
  confidence int not null check (confidence between 0 and 100),
  entry text not null,
  entry_note text not null,
  sl text not null,
  sl_note text not null,
  tp1 text not null,
  tp1_rr text not null,
  tp2 text not null,
  tp2_rr text not null,
  note text not null,
  size text not null,
  valid_until text not null,
  strategy text not null,
  killzone text not null,
  consensus text not null,
  flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists chart_analyses_chart_id_idx on public.chart_analyses(chart_id);
create index if not exists chart_analyses_user_id_idx on public.chart_analyses(user_id);

alter table public.chart_analyses enable row level security;

create policy "Users can view their own chart analyses"
  on public.chart_analyses for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own chart analyses"
  on public.chart_analyses for insert
  to authenticated
  with check (auth.uid() = user_id);
