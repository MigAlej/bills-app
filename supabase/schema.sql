-- Run this in the Supabase SQL Editor. It's safe to run more than once.

-- Bills (this table already existed, so only add what is missing)
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  amount numeric(10, 2) not null,
  note text not null default '',
  date date not null,
  category text
);
alter table public.bills add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.bills alter column user_id set default auth.uid();

-- Let the database generate the id if it's a uuid with no default
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bills' and column_name = 'id'
      and data_type = 'uuid' and column_default is null
  ) then
    alter table public.bills alter column id set default gen_random_uuid();
  end if;
end $$;

-- Only add a policy if bills doesn't have one yet (mine was created from the dashboard)
alter table public.bills enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bills') then
    create policy "own bills" on public.bills for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;
grant select, insert, update, delete on public.bills to authenticated;

-- Transfers from savings to the checking account
create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount numeric(10, 2) not null,
  note text not null default '',
  date date not null
);
-- 'savings' comes out of my savings account, 'other' is money from someone else (e.g. family paying their share)
alter table public.transfers add column if not exists source text not null default 'savings'
  check (source in ('savings', 'other'));
alter table public.transfers enable row level security;
drop policy if exists "own transfers" on public.transfers;
create policy "own transfers" on public.transfers for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.transfers to authenticated;

-- Monthly salary (month is stored as the 1st of the month)
create table if not exists public.salaries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  month date not null,
  amount numeric(10, 2) not null,
  primary key (user_id, month)
);
alter table public.salaries enable row level security;
drop policy if exists "own salaries" on public.salaries;
create policy "own salaries" on public.salaries for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.salaries to authenticated;

-- Categories for the dropdown
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  unique (user_id, name)
);
alter table public.categories enable row level security;
drop policy if exists "own categories" on public.categories;
create policy "own categories" on public.categories for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.categories to authenticated;

-- Starting categories
insert into public.categories (user_id, name)
select u.id, c.name
from auth.users u, unnest(array['Gasolina', 'Mercado', 'Gato']) as c(name)
on conflict do nothing;
