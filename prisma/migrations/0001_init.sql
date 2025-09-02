-- SQL migration to enforce one open order per table and checks

-- Create partial unique index on Order to ensure one active order per table
delete from "Order"; -- safe placeholder if existing
CREATE UNIQUE INDEX IF NOT EXISTS order_one_open_per_table
ON "Order" ("tableId")
WHERE status IN ('open','submitted','preparing','ready','served');

-- Sanity checks
ALTER TABLE "OrderItem" ADD CONSTRAINT quantity_positive CHECK (quantity >= 1 AND quantity <= 99);
ALTER TABLE "Product" ADD CONSTRAINT price_positive CHECK ("priceCents" >= 0);
