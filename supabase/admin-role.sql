-- Stash App — Admin Role & Access Control
-- Jalankan di SQL Editor

-- 1. Kolom role pada profiles
alter table public.profiles
  add column if not exists role text not null default 'user';

-- 2. Helper function: cek apakah uid saat ini adalah admin
--    (security definer agar bisa dibaca policy tanpa RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 3. Promote user pertama ke admin (GANTI EMAIL di bawah)
-- update public.profiles set role = 'admin' where id = (
--   select id from auth.users where email = 'email-kamu@example.com'
-- );

-- 4. (Opsional tapi disarankan) Proteksi profiles dengan policy tambahan:
--    user biasa tidak boleh mengubah kolom role-nya sendiri.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
