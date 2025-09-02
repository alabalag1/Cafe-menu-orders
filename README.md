# Café Menu & Ordering

Full-stack demo using Next.js 14, Prisma and Supabase.

## Features
- Browse menu with categories and products
- Customers sign in with magic link and start orders via table QR token
- One open order per table enforced at database level
- Waiter and kitchen placeholder dashboards
- Seed script creates sample data and QR codes in `qr/`

## Setup
```bash
pnpm install
cp .env.example .env.local # set Supabase keys and database URL
npx prisma generate
npx prisma migrate deploy
pnpm prisma:seed
pnpm dev
```

Run SQL in `supabase/schema.sql` then `supabase/policies.sql` in your Supabase project.
