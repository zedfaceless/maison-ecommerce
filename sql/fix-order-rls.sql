-- ============================================================
-- fix-order-rls.sql — repairs checkout.
--
-- SYMPTOM
--   Clicking "Place Order" returns HTTP 500 from PostgREST:
--     {"code":"42P17",
--      "message":"infinite recursion detected in policy for relation \"orders\""}
--   No order is ever written, and /orders fails to load for the same reason.
--
-- CAUSE
--   Four of the policies in schema.sql reference the *other* table across the
--   orders <-> order_items pair, so evaluating either one re-enters the other:
--
--     orders."Sellers view orders with their items"    -> SELECT FROM order_items
--     order_items."Order items viewable by customer"   -> SELECT FROM orders
--
--   The inner read is itself subject to RLS, so Postgres walks the loop and
--   aborts with 42P17. This is not caused by the project pause — it fires on
--   the first completed checkout against this schema, whenever that happens.
--
-- FIX
--   Move each cross-table lookup into a SECURITY DEFINER function. Such a
--   function executes as its owner (postgres, which has BYPASSRLS), so the
--   inner read is NOT re-checked against RLS and the loop is cut.
--
--   Both functions return only a boolean, and each one compares against
--   auth.uid() internally, so neither can be used to read another user's
--   rows — the caller learns nothing except a fact about themselves.
--
--   search_path is pinned on both. An unpinned search_path on a
--   SECURITY DEFINER function is a privilege-escalation vector: the caller
--   could otherwise shadow `orders` with their own table.
--
-- SAFE TO RE-RUN. Idempotent.
--
-- HOW TO RUN
--   Supabase Dashboard > SQL Editor > paste this whole file > Run.
--   Plain SQL only, no psql meta-commands.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helper functions
-- ------------------------------------------------------------

-- True when the current user is the customer who placed this order.
CREATE OR REPLACE FUNCTION public.is_order_owner(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = p_order_id
      AND orders.customer_id = auth.uid()
  );
$$;

-- True when the current user is the seller on at least one line of this order.
CREATE OR REPLACE FUNCTION public.seller_has_items_in_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items
    WHERE order_items.order_id = p_order_id
      AND order_items.seller_id = auth.uid()
  );
$$;

-- Policies are evaluated as the *calling* role, so anon and authenticated
-- both need EXECUTE or policy evaluation raises "permission denied" instead
-- of simply returning no rows. For anon, auth.uid() is NULL and both
-- functions return false — which is the correct answer.
REVOKE ALL ON FUNCTION public.is_order_owner(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seller_has_items_in_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_order_owner(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seller_has_items_in_order(UUID) TO anon, authenticated;

-- ------------------------------------------------------------
-- 2. Replace the four recursive policies
--
-- The three non-recursive policies from schema.sql are deliberately left
-- untouched: orders."Customers view own orders",
-- orders."Customers create orders", order_items."Order items viewable by
-- seller". They compare a column to auth.uid() directly and never re-enter
-- the other table.
-- ------------------------------------------------------------

-- orders: a seller may read an order that contains one of their lines.
DROP POLICY IF EXISTS "Sellers view orders with their items" ON orders;
CREATE POLICY "Sellers view orders with their items" ON orders
  FOR SELECT
  USING (public.seller_has_items_in_order(orders.id));

-- orders: ...and may advance its status (approve / ship / deliver).
DROP POLICY IF EXISTS "Sellers update orders with their items" ON orders;
CREATE POLICY "Sellers update orders with their items" ON orders
  FOR UPDATE
  USING (public.seller_has_items_in_order(orders.id));

-- order_items: a customer may read the lines of an order they placed.
DROP POLICY IF EXISTS "Order items viewable by customer" ON order_items;
CREATE POLICY "Order items viewable by customer" ON order_items
  FOR SELECT
  USING (public.is_order_owner(order_items.order_id));

-- order_items: ...and may write lines onto an order they placed. This is the
-- policy that blocked the second half of checkout.
DROP POLICY IF EXISTS "Customers insert order items" ON order_items;
CREATE POLICY "Customers insert order items" ON order_items
  FOR INSERT
  WITH CHECK (public.is_order_owner(order_items.order_id));

-- ------------------------------------------------------------
-- 3. Verify
--
-- Should return one row and no 42P17. If this succeeds, checkout works.
-- ------------------------------------------------------------
SELECT 'order RLS recursion fixed' AS status, count(*) AS visible_orders FROM orders;
