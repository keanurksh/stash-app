-- Money Manager — Supabase Schema
-- Jalankan script ini di Supabase Dashboard > SQL Editor

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Categories Table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  icon text default 'Wallet',
  is_default boolean default false
);

-- Seed Default Categories
insert into public.categories (name, type, icon, is_default) values
  ('Makanan & Minuman', 'expense', 'Utensils', true),
  ('Transportasi', 'expense', 'Car', true),
  ('Belanja & Lifestyle', 'expense', 'ShoppingBag', true),
  ('Tagihan & Langganan', 'expense', 'CreditCard', true),
  ('Hiburan', 'expense', 'Film', true),
  ('Kesehatan', 'expense', 'HeartPulse', true),
  ('Gaji', 'income', 'Banknote', true),
  ('Freelance', 'income', 'Laptop', true),
  ('Investasi', 'income', 'TrendingUp', true),
  ('Lainnya', 'income', 'Plus', true);

-- 3. Transactions Table
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(15, 2) not null,
  type text check (type in ('income', 'expense')) not null,
  date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- RLS Policies for Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for Categories (read-only global seed data)
create policy "Authenticated users can view categories"
  on public.categories for select
  to authenticated
  using (true);

-- RLS Policies for Transactions
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index idx_transactions_user_date on public.transactions (user_id, date desc);
create index idx_transactions_user_category on public.transactions (user_id, category_id);
