-- Polysia Supabase schema
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  streak_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  simplified text not null,
  traditional text not null,
  pinyin text not null,
  english text not null,
  grammar text not null default '',
  notes text not null default '',
  interval integer not null default 0,
  repetition integer not null default 0,
  efactor numeric not null default 2.5,
  due_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_flashcards_user_due_date on public.flashcards(user_id, due_date);

drop trigger if exists trg_flashcards_updated_at on public.flashcards;
create trigger trg_flashcards_updated_at
before update on public.flashcards
for each row
execute function public.set_updated_at();

alter table public.flashcards enable row level security;

drop policy if exists "flashcards_select_own" on public.flashcards;
create policy "flashcards_select_own"
on public.flashcards
for select
using (auth.uid() = user_id);

drop policy if exists "flashcards_insert_own" on public.flashcards;
create policy "flashcards_insert_own"
on public.flashcards
for insert
with check (auth.uid() = user_id);

drop policy if exists "flashcards_update_own" on public.flashcards;
create policy "flashcards_update_own"
on public.flashcards
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "flashcards_delete_own" on public.flashcards;
create policy "flashcards_delete_own"
on public.flashcards
for delete
using (auth.uid() = user_id);

create table if not exists public.learning_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('flashcards', 'reading', 'roleplay')),
  action text not null,
  minutes_spent integer not null default 0 check (minutes_spent >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_learning_activity_user_created_at
  on public.learning_activity(user_id, created_at desc);

alter table public.learning_activity enable row level security;

drop policy if exists "learning_activity_select_own" on public.learning_activity;
create policy "learning_activity_select_own"
on public.learning_activity
for select
using (auth.uid() = user_id);

drop policy if exists "learning_activity_insert_own" on public.learning_activity;
create policy "learning_activity_insert_own"
on public.learning_activity
for insert
with check (auth.uid() = user_id);

drop policy if exists "learning_activity_update_own" on public.learning_activity;
create policy "learning_activity_update_own"
on public.learning_activity
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "learning_activity_delete_own" on public.learning_activity;
create policy "learning_activity_delete_own"
on public.learning_activity
for delete
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
