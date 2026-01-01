-- Add explicit RLS policies to deny direct client access for INSERT, UPDATE, DELETE
-- This provides defense-in-depth even though Edge Functions use service role

-- Deny direct client INSERT to bookings
CREATE POLICY "Deny direct client INSERT to bookings"
ON public.bookings
FOR INSERT
WITH CHECK (false);

-- Deny direct client UPDATE to bookings  
CREATE POLICY "Deny direct client UPDATE to bookings"
ON public.bookings
FOR UPDATE
USING (false);

-- Deny direct client DELETE to bookings
CREATE POLICY "Deny direct client DELETE to bookings"
ON public.bookings
FOR DELETE
USING (false);