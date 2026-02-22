-- ─────────────────────────────────────────────────────────────────────────────
-- Atlas – Initial Schema
-- Run this against your Supabase project via the SQL editor or CLI.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Profiles ──────────────────────────────────────────────────────────────────
-- One row per auth.users entry. Created automatically by trigger below.
create table public.profiles (
  id                  uuid primary key references auth.users on delete cascade,
  email               text not null,
  full_name           text,
  stripe_customer_id  text,
  plan                text not null default 'free'
                        check (plan in ('free', 'pro', 'agency')),
  plan_status         text not null default 'active'
                        check (plan_status in ('active', 'trialing', 'past_due', 'canceled')),
  created_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── Projects ──────────────────────────────────────────────────────────────────
create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  client_name     text not null,
  current_phase   int  not null default 1,
  status          text not null default 'draft',
  discovery       jsonb,
  journeys        jsonb,
  conversions     jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- ── Stripe Events (deduplication log) ────────────────────────────────────────
create table public.stripe_events (
  id            uuid primary key default gen_random_uuid(),
  event_id      text unique not null,
  type          text not null,
  processed_at  timestamptz not null default now()
);

-- Service role only — no RLS needed (webhook function uses service key)

-- ── Auto-create profile on signup ────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── updated_at auto-update ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();
