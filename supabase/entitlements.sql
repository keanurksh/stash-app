-- Stash App — Entitlement Schema (Free vs Pro)
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- (Script ini AMAN dijalankan berulang kali, menggunakan IF NOT EXISTS)

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1a. Subscriptions (entitlement user)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  status text not null default 'free' check (status in ('free', 'pro')),
  ocr_usage_count integer not null default 0,
  ocr_reset_date date not null default (date_trunc('month', now()) + interval '1 month')::date,
  plan_started_at timestamptz,
  plan_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b. Wallets (multi-account)
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'ewallet' check (type in ('bank', 'ewallet', 'cash')),
  balance numeric(15, 2) not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 1c. Wishlists (target tabungan)
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(15, 2) not null,
  current_amount numeric(15, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'achieved', 'archived')),
  deadline date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index if not exists idx_subscriptions_user on public.subscriptions (user_id);
create index if not exists idx_wallets_user on public.wallets (user_id);
create index if not exists idx_wishlists_user_status on public.wishlists (user_id, status);

-- ============================================================
-- 3. RLS
-- ============================================================

alter table public.subscriptions enable row level security;
alter table public.wallets enable row level security;
alter table public.wishlists enable row level security;

drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own subscription" on public.subscriptions;
create policy "Users can update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can view own wallets" on public.wallets;
create policy "Users can view own wallets"
  on public.wallets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own wallets" on public.wallets;
create policy "Users can insert own wallets"
  on public.wallets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own wallets" on public.wallets;
create policy "Users can update own wallets"
  on public.wallets for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own wallets" on public.wallets;
create policy "Users can delete own wallets"
  on public.wallets for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own wishlists" on public.wishlists;
create policy "Users can view own wishlists"
  on public.wishlists for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own wishlists" on public.wishlists;
create policy "Users can insert own wishlists"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own wishlists" on public.wishlists;
create policy "Users can update own wishlists"
  on public.wishlists for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlists" on public.wishlists;
create policy "Users can delete own wishlists"
  on public.wishlists for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. TRIGGER: auto-provision data untuk user baru
--    (subscriptions free + 1 wallet default)
--    Menggantikan/menempel pada trigger on_auth_user_created
--    yang sudah ada di schema.sql
-- ============================================================

create or replace function public.handle_new_user_entitlements()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Subscription: free, 0 OCR usage, reset 1 bulan dari sekarang
  insert into public.subscriptions (user_id, status, ocr_usage_count, ocr_reset_date)
  values (
    new.id,
    'free',
    0,
    (now() + interval '1 month')::date
  )
  on conflict (user_id) do nothing;

  -- Dompet default
  insert into public.wallets (user_id, name, type, is_default)
  values (new.id, 'Dompet Utama', 'ewallet', true);

  return new;
end;
$$;

-- Trigger terpisah agar tidak konflik dengan handle_new_user() yang lama
drop trigger if exists on_auth_user_created_entitlements on auth.users;
create trigger on_auth_user_created_entitlements
  after insert on auth.users
  for each row execute procedure public.handle_new_user_entitlements();

-- ============================================================
-- 5. TRIGGER: limitasi fitur free plan
--    Free: max 1 wallet, max 1 wishlist aktif. Pro: unlimited.
--    Error code 'STASH_LIMIT' bisa ditangkap client untuk
--    menampilkan PaywallModal.
-- ============================================================

create or replace function public.enforce_wallet_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_status text;
begin
  select status into user_status from public.subscriptions where user_id = new.user_id;

  if user_status is distinct from 'free' then
    return new;
  end if;

  if (select count(*) from public.wallets where user_id = new.user_id) >= 1 then
    raise exception 'WALLET_LIMIT_REACHED'
      using errcode = 'P0001', detail = 'STASH_LIMIT';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_wallet_limit_trigger on public.wallets;
create trigger enforce_wallet_limit_trigger
  before insert on public.wallets
  for each row execute procedure public.enforce_wallet_limit();

create or replace function public.enforce_wishlist_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_status text;
begin
  select status into user_status from public.subscriptions where user_id = new.user_id;

  if user_status is distinct from 'free' then
    return new;
  end if;

  if (select count(*) from public.wishlists where user_id = new.user_id and status = 'active') >= 1 then
    raise exception 'WISHLIST_LIMIT_REACHED'
      using errcode = 'P0001', detail = 'STASH_LIMIT';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_wishlist_limit_trigger on public.wishlists;
create trigger enforce_wishlist_limit_trigger
  before insert on public.wishlists
  for each row execute procedure public.enforce_wishlist_limit();
