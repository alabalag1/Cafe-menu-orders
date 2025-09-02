-- Database schema for cafe menu ordering app
create extension if not exists pgcrypto;

-- Enums
create type "Role" as enum ('admin','waiter','customer');
create type "OrderStatus" as enum ('open','submitted','preparing','ready','served','closed','cancelled');

-- Users table mirrors auth
create table if not exists "User" (
  id uuid primary key,
  email text unique not null,
  role "Role" default 'customer' not null,
  "createdAt" timestamptz default now() not null
);

-- Tables
create table if not exists "Table" (
  id text primary key,
  name text not null,
  number int unique not null,
  capacity int not null,
  "isActive" boolean default true,
  "tableToken" text unique not null
);

-- Categories & Products
create table if not exists "Category" (
  id text primary key,
  name text unique not null,
  description text,
  "sortOrder" int default 0 not null
);

create table if not exists "Product" (
  id text primary key,
  "categoryId" text references "Category"(id) on delete cascade,
  name text not null,
  description text,
  "priceCents" int not null,
  "isAvailable" boolean default true,
  "imageUrl" text,
  constraint price_positive check ("priceCents" >= 0)
);

-- Orders
create table if not exists "Order" (
  id text primary key,
  "tableId" text references "Table"(id) on delete restrict,
  status "OrderStatus" default 'open' not null,
  "subtotalCents" int default 0 not null,
  "createdAt" timestamptz default now() not null,
  "updatedAt" timestamptz default now() not null,
  "createdByUserId" uuid references "User"(id),
  "customerId" uuid references "User"(id)
);

create table if not exists "OrderItem" (
  id text primary key,
  "orderId" text references "Order"(id) on delete cascade,
  "productId" text references "Product"(id) on delete restrict,
  quantity int not null,
  note text,
  "lineTotalCents" int not null,
  "createdAt" timestamptz default now() not null,
  constraint quantity_positive check (quantity >= 1 and quantity <= 99)
);

-- One open order per table
create unique index if not exists order_one_open_per_table on "Order"("tableId")
where status in ('open','submitted','preparing','ready','served');
