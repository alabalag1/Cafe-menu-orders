create extension if not exists pgcrypto;

create table if not exists tables (
  id serial primary key,
  name text not null,
  qr_slug text unique,
  qr_token text unique
);

create table if not exists categories (
  id serial primary key,
  name text not null,
  sort_order int default 0
);

create table if not exists menu_items (
  id serial primary key,
  category_id int references categories(id),
  name text not null,
  description text,
  price_cents int not null,
  is_available boolean default true,
  image_url text
);

do $$ begin
  create type order_status as enum ('pending','accepted','in_progress','ready','delivered','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_id int references tables(id) not null,
  created_at timestamptz default now(),
  status order_status default 'pending',
  note text,
  total_cents int not null
);

create table if not exists order_items (
  id serial primary key,
  order_id uuid references orders(id) on delete cascade,
  menu_item_id int references menu_items(id),
  qty int not null check (qty > 0),
  price_cents int not null
);

create table if not exists order_events (
  id serial primary key,
  order_id uuid references orders(id) on delete cascade,
  event text not null,
  at timestamptz default now()
);

-- Temporarily disable RLS for testing
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;

-- Drop & recreate policies to avoid duplicates across reruns
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);

drop policy if exists "insert categories" on categories;
create policy "insert categories" on categories for insert to authenticated with check (auth.role() = 'authenticated');

drop policy if exists "update categories" on categories;
create policy "update categories" on categories for update to authenticated using (auth.role() = 'authenticated');

drop policy if exists "delete categories" on categories;
create policy "delete categories" on categories for delete to authenticated using (auth.role() = 'authenticated');

drop policy if exists "public read items" on menu_items;
create policy "public read items" on menu_items for select using (true);

drop policy if exists "insert menu_items" on menu_items;
create policy "insert menu_items" on menu_items for insert to authenticated with check (auth.role() = 'authenticated');

drop policy if exists "update menu_items" on menu_items;
create policy "update menu_items" on menu_items for update to authenticated using (auth.role() = 'authenticated');

drop policy if exists "delete menu_items" on menu_items;
create policy "delete menu_items" on menu_items for delete to authenticated using (auth.role() = 'authenticated');

drop policy if exists "insert orders" on orders;
create policy "insert orders" on orders for insert with check (true);

drop policy if exists "select orders" on orders;
create policy "select orders" on orders for select using (true);

drop policy if exists "update orders by staff" on orders;
create policy "update orders by staff" on orders for update using (true);

drop policy if exists "insert order_items" on order_items;
create policy "insert order_items" on order_items for insert with check (true);

drop policy if exists "select order_items" on order_items;
create policy "select order_items" on order_items for select using (true);

drop policy if exists "insert events" on order_events;
create policy "insert events" on order_events for insert with check (true);

drop policy if exists "select events" on order_events;
create policy "select events" on order_events for select using (true);

-- Sample data for testing
insert into tables (name, qr_slug) values 
  ('Маса 1', 'table-1'),
  ('Маса 2', 'table-2'),
  ('Маса 3', 'table-3'),
  ('Маса 4', 'table-4'),
  ('Маса 5', 'table-5')
on conflict (qr_slug) do nothing;

insert into categories (name, sort_order) values 
  ('Кафе', 0),
  ('Десерти', 1),
  ('Напитки', 2)
on conflict do nothing;

insert into menu_items (category_id, name, description, price_cents, is_available) values 
  (1, 'Еспресо', 'Двойно', 250, true),
  (1, 'Капучино', '250ml', 390, true),
  (1, 'Лате', '300ml с арт', 420, true),
  (2, 'Тирамису', 'Домашно приготвен', 690, true),
  (2, 'Чийзкейк', 'С горски плодове', 590, true),
  (3, 'Кока-Кола', '330ml', 280, true),
  (3, 'Вода', '500ml', 180, true)
on conflict do nothing;

-- Enable Realtime on: public.orders (and optional public.order_items)

-- Ensure tokens are set for existing rows
update tables set qr_token = coalesce(qr_token, encode(gen_random_bytes(16), 'hex'));
