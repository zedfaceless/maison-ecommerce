-- ============================================================
-- seed-demo.sql — run AFTER sql/schema.sql
--
-- schema.sql seeds 30 products, 3 categories, 3 promotions and
-- 4 carriers, but leaves two gaps that make the demo look broken
-- even when the backend is perfectly healthy:
--
--   1. seeded products have seller_id = NULL, so every seller view
--      (they all filter .eq("seller_id", auth.uid())) is empty
--   2. seeded products have image_url = NULL, so the storefront
--      renders 30 blank image frames
--
-- This fixes both. It is idempotent — safe to re-run.
--
-- BEFORE RUNNING:
--   1. Sign up in the app with role = Seller
--   2. Replace the email on the marked line below with that account's
--   3. Paste this whole file into the Supabase SQL Editor and Run
--
-- Plain SQL only — no psql meta-commands, so it runs as-is in the
-- Supabase SQL Editor.
-- ============================================================

DO $$
DECLARE
  -- >>> CHANGE THIS to your seller account's email <<<
  demo_seller_email CONSTANT TEXT := 'seller@example.com';

  seller  UUID;
  claimed INT;
  imaged  INT;

  -- Product imagery. The app reads products.image_url (singular) in the
  -- storefront, product detail, cart, checkout and order history.
  --
  -- These are external Unsplash URLs, all verified reachable when written.
  -- Hotlinked third-party images do rot — four of the static design sites
  -- in this account already have dead ones. For anything long-lived,
  -- upload to Supabase Storage and point image_url at the bucket URL.
  urls CONSTANT TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=800&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80'
  ];
BEGIN
  -- 1. Assign every unowned product to the demo seller ---------
  SELECT id INTO seller
  FROM profiles
  WHERE email = demo_seller_email AND role = 'seller';

  IF seller IS NULL THEN
    RAISE EXCEPTION
      'No seller profile found for %. Sign up in the app as a Seller first, set demo_seller_email above, then re-run.',
      demo_seller_email;
  END IF;

  UPDATE products SET seller_id = seller WHERE seller_id IS NULL;
  GET DIAGNOSTICS claimed = ROW_COUNT;

  -- 2. Give every image-less product an image ------------------
  WITH numbered AS (
    SELECT id,
           ((ROW_NUMBER() OVER (ORDER BY created_at, id) - 1)
             % array_length(urls, 1))::INT + 1 AS slot
    FROM products
    WHERE image_url IS NULL OR image_url = ''
  )
  UPDATE products p
  SET image_url  = urls[numbered.slot],
      images     = ARRAY[urls[numbered.slot]],
      updated_at = NOW()
  FROM numbered
  WHERE p.id = numbered.id;
  GET DIAGNOSTICS imaged = ROW_COUNT;

  RAISE NOTICE 'Assigned % product(s) to %; set images on % product(s).',
    claimed, demo_seller_email, imaged;
END $$;

-- 3. Verify --------------------------------------------------
SELECT
  COUNT(*)                                                   AS products_total,
  COUNT(*) FILTER (WHERE seller_id IS NOT NULL)              AS with_seller,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL
                     AND image_url <> '')                    AS with_image,
  COUNT(*) FILTER (WHERE is_featured)                         AS featured
FROM products;
