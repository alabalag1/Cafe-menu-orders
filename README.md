# Café Menu + Table Orders (Next.js + Supabase)

MVP with:
- QR menu per table (`/menu?table=12`)
- Place orders
- Kitchen screen (`/kitchen`) and Waiter screen (`/orders`)
- Admin **Products** CRUD (`/admin/products`)
- Realtime order status updates

## Quick start
```bash
pnpm i   # or npm i / yarn
cp .env.example .env.local  # fill your Supabase keys
pnpm dev
```
Then run the SQL in `supabase/schema.sql` in Supabase SQL editor, and enable Realtime on `public.orders`.

## Routes
- Customer menu: `/menu?table=1`
- Kitchen: `/kitchen`
- Waiter: `/orders`
- Admin Products: `/admin/products`

## Notes
- API uses the `SUPABASE_SERVICE_ROLE_KEY` in server routes only.
- UI is minimal by design.
