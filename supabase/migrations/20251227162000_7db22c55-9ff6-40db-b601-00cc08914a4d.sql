-- Drop the permissive RLS policy that allows anyone to read all bookings
DROP POLICY IF EXISTS "Customers can view their own bookings by phone" ON public.bookings;

-- Create a restrictive policy - only allow access via service role (Edge Functions)
-- This effectively blocks direct client access while allowing Edge Functions to work
CREATE POLICY "Deny direct client access to bookings"
ON public.bookings
FOR SELECT
USING (false);

-- Note: Edge Functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS