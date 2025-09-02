# Café Menu + Table Orders (Next.js + Supabase)

Minimal MVP:
- QR menu per table (`/menu?table=12`)
- Place orders
- Kitchen screen (`/kitchen`) and Waiter screen (`/orders`)
- Realtime order status updates

## Quick start
```bash
pnpm i   # or npm i / yarn
cp .env.example .env.local  # fill your Supabase keys
pnpm dev
```
Then run the SQL in `supabase/schema.sql` inside your Supabase project's SQL editor.

## Notes
- **Do not** expose `SUPABASE_SERVICE_ROLE_KEY` in the browser. It's used only in API routes.
- The UI is intentionally minimal; extend as you wish.
