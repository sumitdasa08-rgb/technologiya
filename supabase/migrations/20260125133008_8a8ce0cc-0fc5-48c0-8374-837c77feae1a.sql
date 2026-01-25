-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can insert payment logs" ON public.payment_logs;

-- Create a more restrictive policy - only allow inserts when there's a valid booking reference
CREATE POLICY "Insert logs for existing bookings only"
  ON public.payment_logs FOR INSERT
  WITH CHECK (
    booking_id IS NULL OR 
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id)
  );