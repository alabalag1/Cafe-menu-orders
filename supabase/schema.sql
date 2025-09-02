-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

create table if not exists tables (
  id serial primary key,
  name text not null,
  qr_slug text unique
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

-- Basic RLS (adjust to your needs)
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;

-- Public can read categories/menu_items
create policy "public read categories" on categories for select using (true);
create policy "public read items" on menu_items for select using (true);

-- Anyone can insert an order (from table QR)
create policy "insert orders" on orders for insert with check (true);
-- Staff can update orders by role claim
create policy "update orders by staff" on orders for update using (
  auth.jwt() ->> 'role' in ('waiter','kitchen','admin')
);

-- Anyone can insert order items for their newly created order
create policy "insert order_items" on order_items for insert with check (true);
-- Read-only for order_items for everyone (optional)
create policy "select order_items" on order_items for select using (true);

-- Read-only for events (optional)
create policy "insert events" on order_events for insert with check (true);
create policy "select events" on order_events for select using (true);

-- Realtime
-- In Supabase dashboard, enable Realtime on: public.orders, public.order_items
