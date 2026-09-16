-- Stash App — Wallet pada transaksi
-- Jalankan sekali di SQL Editor setelah entitlements.sql

-- Transaksi menempel ke dompet asal (nullable: transaksi lama tetap valid)
alter table public.transactions
  add column if not exists wallet_id uuid references public.wallets(id) on delete set null;

create index if not exists idx_transactions_user_wallet
  on public.transactions (user_id, wallet_id);
