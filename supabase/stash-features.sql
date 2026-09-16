-- Stash App — Fitur Baru: Split Bill, Budget Caps, Streak/Gamifikasi
-- Jalankan di SQL Editor. Aman dijalankan berulang dengan penyesuaian minor.

-- A. Tabel Split Bill (Patungan Nongkrong)
create table if not exists public.split_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  total_amount numeric(15, 2) not null,
  status text check (status in ('active', 'completed')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.split_bill_items (
  id uuid primary key default gen_random_uuid(),
  split_bill_id uuid references public.split_bills(id) on delete cascade not null,
  friend_name text not null,
  item_description text,
  amount numeric(15, 2) not null,
  is_paid boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- B. Tabel Budget Caps (Pos Anggaran / Batas Pengeluaran Kategori)
create table if not exists public.budget_caps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  target_amount numeric(15, 2) not null,
  month_year text not null, -- Format: "2026-09"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category_id, month_year)
);

-- C. Update Subscriptions Table (Streak & Gamifikasi)
alter table public.subscriptions
  add column if not exists current_streak integer default 0,
  add column if not exists last_active_date date,
  add column if not exists saving_level text default 'Bronze Saver';

-- Indexes
create index if not exists idx_split_bills_user on public.split_bills (user_id, status);
create index if not exists idx_split_bill_items_bill on public.split_bill_items (split_bill_id);
create index if not exists idx_budget_caps_user_month on public.budget_caps (user_id, month_year);

-- RLS
alter table public.split_bills enable row level security;
alter table public.split_bill_items enable row level security;
alter table public.budget_caps enable row level security;

drop policy if exists "Users manage own split_bills" on public.split_bills;
create policy "Users manage own split_bills" on public.split_bills for all using (auth.uid() = user_id);

drop policy if exists "Users manage own split_bill_items" on public.split_bill_items;
create policy "Users manage own split_bill_items" on public.split_bill_items for all using (
  exists (select 1 from public.split_bills where id = split_bill_items.split_bill_id and user_id = auth.uid())
);

drop policy if exists "Users manage own budget_caps" on public.budget_caps;
create policy "Users manage own budget_caps" on public.budget_caps for all using (auth.uid() = user_id);
