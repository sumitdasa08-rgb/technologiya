-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can read bookings by order_id" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update booking payment status" ON public.bookings;

-- No new policies needed - edge functions use service role which bypasses RLS
-- The table is now only accessible via service role (edge functions)