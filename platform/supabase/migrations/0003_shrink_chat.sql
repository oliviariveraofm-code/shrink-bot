-- The Shrink: real behavioral chat, backed by the trader's own logged
-- activity (charts + chart_analyses -- no new logging table needed for
-- that part, since every upload already *is* a logged event). This
-- migration only adds the conversation history for the chat itself.
-- Run after 0001_init.sql and 0002_mock_analysis.sql. Safe to re-run
-- (IF NOT EXISTS).
--
-- `source` is null for role='user' rows (the trader wrote it) and set
-- for role='assistant' rows to say whether the reply came from Claude
-- or the mock fallback -- same honesty-badge pattern as
-- chart_analyses.source, driven by whether ANTHROPIC_API_KEY is
-- configured (see lib/ai/shrinkChat.ts).

create table if not exists public.shrink_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  source text check (source in ('mock', 'claude')),
  created_at timestamptz not null default now()
);

create index if not exists shrink_messages_user_id_created_at_idx
  on public.shrink_messages(user_id, created_at);

alter table public.shrink_messages enable row level security;

-- Same per-user boundary as every other table -- a trader only ever
-- sees their own conversation with The Shrink, never anyone else's.
create policy "Users can view their own shrink messages"
  on public.shrink_messages for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own shrink messages"
  on public.shrink_messages for insert
  to authenticated
  with check (auth.uid() = user_id);
