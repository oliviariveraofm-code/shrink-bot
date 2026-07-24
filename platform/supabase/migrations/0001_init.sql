-- Phase 3 Step 4: charts table + storage bucket, both RLS-scoped per user.
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- against a fresh project. Safe to re-run (uses IF NOT EXISTS / ON CONFLICT).

-- ============================================================
-- charts table
-- ============================================================
create table if not exists public.charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  status text not null default 'pending' check (status in ('pending', 'complete')),
  created_at timestamptz not null default now()
);

create index if not exists charts_user_id_idx on public.charts(user_id);

alter table public.charts enable row level security;

-- Users can only ever see/modify their own chart rows -- this, not the
-- application's WHERE clauses, is the actual security boundary.
create policy "Users can view their own charts"
  on public.charts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own charts"
  on public.charts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own charts"
  on public.charts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own charts"
  on public.charts for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- storage bucket for uploaded chart images (private -- not public)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('chart-uploads', 'chart-uploads', false)
on conflict (id) do nothing;

-- Uploads are stored at `{user_id}/{filename}` -- these policies enforce
-- that a user can only read/write objects under their own user_id folder,
-- checked via the first path segment (storage.foldername).
create policy "Users can view their own chart files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'chart-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload their own chart files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chart-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own chart files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'chart-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'chart-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own chart files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'chart-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
