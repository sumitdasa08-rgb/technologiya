-- Restrict payment_logs SELECT to service role only
DROP POLICY IF EXISTS "Service role can read logs" ON public.payment_logs;

-- Create new policy that actually restricts to service role
-- Note: anon/authenticated roles can still INSERT for client-side logging
CREATE POLICY "Only service role can read logs" 
ON public.payment_logs 
FOR SELECT 
USING (auth.role() = 'service_role');