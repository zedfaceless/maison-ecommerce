-- ============================================================
-- backfill-sellers.sql — gives the 30 seeded products an owner.
--
-- WHY
--   schema.sql inserts its 30 demo products with seller_id = NULL. Every
--   seller-side view filters on .eq("seller_id", user.id):
--
--     app/(seller)/seller-products/page.tsx
--     app/(seller)/seller-inventory/page.tsx
--     app/(seller)/seller-orders/page.tsx
--
--   so with no owner set, a seller account signs in to a completely empty
--   dashboard even though the storefront is full. The customer storefront is
--   unaffected — nothing on it displays a seller.
--
-- SCOPE
--   This touches products.seller_id and nothing else. It deliberately does
--   NOT rewrite image_url, which is what sql/seed-demo.sql would also do:
--   this project's images were restored intact and must not be overwritten.
--   (seed-demo.sql was written for a fresh instance. Do not run it here.)
--
-- IDEMPOTENT
--   Only claims rows where seller_id IS NULL, so re-running is a no-op and
--   it will never reassign a product a real seller has since created.
--
-- BEFORE RUNNING
--   Set demo_seller_email below to the seller account that should own the
--   demo catalogue. Existing seller accounts in this project:
--     seller@gmail.com      (Seller Test)
--     sellertest@gmail.com  (Seller Tests)
--
-- HOW TO RUN
--   Supabase Dashboard > SQL Editor > paste this whole file > Run.
-- ============================================================

DO $$
DECLARE
  -- >>> CHANGE THIS if you want a different owner <<<
  demo_seller_email CONSTANT TEXT := 'seller@gmail.com';

  seller_uid UUID;
  claimed    INT;
BEGIN
  SELECT id INTO seller_uid
  FROM profiles
  WHERE email = demo_seller_email
    AND role = 'seller';

  IF seller_uid IS NULL THEN
    RAISE EXCEPTION
      'No profile with email % and role=seller. Sign up in the app with role Seller first, or correct demo_seller_email.',
      demo_seller_email;
  END IF;

  UPDATE products
     SET seller_id = seller_uid,
         updated_at = NOW()
   WHERE seller_id IS NULL;

  GET DIAGNOSTICS claimed = ROW_COUNT;

  RAISE NOTICE 'Assigned % product(s) to % (%).', claimed, demo_seller_email, seller_uid;
END $$;

-- Verify: expect unowned = 0.
SELECT
  count(*)                                    AS total_products,
  count(*) FILTER (WHERE seller_id IS NULL)   AS unowned,
  count(DISTINCT seller_id)                   AS distinct_sellers
FROM products;
