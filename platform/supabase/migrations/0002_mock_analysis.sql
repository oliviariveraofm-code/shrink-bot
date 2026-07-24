-- Phase 3 Step 5: mock analysis results, linked 1:1 to a chart.
-- Run after 0001_init.sql. Safe to re-run (IF NOT EXISTS).
--
-- Everything stored here is placeholder data generated at upload time --
-- there is no real chart-reading AI yet. The `MOCK ANALYSIS` badge in the
-- UI (components/TradeCardMock.tsx) is the user-facing honesty signal;
-- this table just needs to exist so that badge has something to attach to.

create table if not exists public.mock_analyses (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid not null unique references public.charts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
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

create index if not exists mock_analyses_chart_id_idx on public.mock_analyses(chart_id);
create index if not exists mock_analyses_user_id_idx on public.mock_analyses(user_id);

alter table public.mock_analyses enable row level security;

create policy "Users can view their own mock analyses"
  on public.mock_analyses for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own mock analyses"
  on public.mock_analyses for insert
  to authenticated
  with check (auth.uid() = user_id);
