-- RLS helper function
create or replace function auth_role() returns text language sql stable as
$$ select coalesce(nullif(current_setting('request.jwt.claims', true)::jsonb->>'role',''), 'anonymous') $$;

-- Enable RLS
alter table "User" enable row level security;
alter table "Table" enable row level security;
alter table "Category" enable row level security;
alter table "Product" enable row level security;
alter table "Order" enable row level security;
alter table "OrderItem" enable row level security;

-- Tables policies
create policy table_read_for_users on "Table"
for select using (
  auth_role() in ('customer','waiter','admin')
);

create policy table_admin_write on "Table"
for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- Categories & Products
create policy category_public_read on "Category"
for select using (true);

create policy product_public_read on "Product"
for select using (true);

create policy category_admin_write on "Category"
for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

create policy product_admin_write on "Product"
for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- Orders policies
create policy order_rw_staff on "Order"
for all using (auth_role() in ('waiter','admin'))
with check (auth_role() in ('waiter','admin'));

create policy order_item_rw_staff on "OrderItem"
for all using (auth_role() in ('waiter','admin'))
with check (auth_role() in ('waiter','admin'));

create policy order_customer_insert on "Order"
for insert to public with check (
  auth_role() = 'customer' and customerId = auth.uid()
);

create policy order_customer_select on "Order"
for select using (
  auth_role() in ('customer','waiter','admin') and (
    auth_role() in ('waiter','admin') or customerId = auth.uid()
  )
);

create policy order_customer_update on "Order"
for update using (
  auth_role() = 'customer' and customerId = auth.uid() and status in ('open','submitted')
) with check (
  auth_role() = 'customer' and customerId = auth.uid() and status in ('open','submitted')
);

create policy item_customer_cud on "OrderItem"
for all using (
  auth_role() = 'customer' and exists (
    select 1 from "Order" o
    where o.id = "OrderItem".orderId and o.customerId = auth.uid() and o.status in ('open','submitted')
  )
) with check (
  auth_role() = 'customer' and exists (
    select 1 from "Order" o
    where o.id = "OrderItem".orderId and o.customerId = auth.uid() and o.status in ('open','submitted')
  )
);
