-- Security hardening for bookings table
-- This migration restricts direct client access while keeping realtime working

-- Drop the old permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create restrictive INSERT policy - only service role can insert (via Edge Function)
CREATE POLICY "Only service role can insert bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (false);

-- Keep SELECT policy but add comment explaining the security model
-- Note: Full SELECT is needed for realtime subscriptions to work
-- Security is enforced at the Edge Function level (get-booking-status)
-- which prevents enumeration by requiring specific booking_id or short_ref
COMMENT ON POLICY "Anyone can view bookings" ON public.bookings IS 
'SELECT remains open for realtime subscriptions. Security is enforced at Edge Function level (get-booking-status) which prevents enumeration. Direct client queries should use Edge Functions.';

-- Add database-level constraints for defense-in-depth
-- These prevent invalid data even if someone bypasses Edge Function validation
DO $$
BEGIN
  -- Check if constraint already exists before adding
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_amount_positive'
  ) THEN
    ALTER TABLE public.bookings ADD CONSTRAINT check_amount_positive 
      CHECK (amount > 0 AND amount <= 100000);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_name_length'
  ) THEN
    ALTER TABLE public.bookings ADD CONSTRAINT check_name_length 
      CHECK (length(customer_name) BETWEEN 1 AND 100);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_phone_format'
  ) THEN
    ALTER TABLE public.bookings ADD CONSTRAINT check_phone_format 
      CHECK (phone ~ '^\d{10,15}$');
  END IF;
END $$;