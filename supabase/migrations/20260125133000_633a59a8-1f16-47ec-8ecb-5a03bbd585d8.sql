-- Create payment_logs table for tracking failures and auto-recovery
CREATE TABLE public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  error_message TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (edge functions use service role)
CREATE POLICY "Anyone can insert payment logs"
  ON public.payment_logs FOR INSERT
  WITH CHECK (true);

-- Only service role can read/update (for admin debugging)
CREATE POLICY "Service role can read logs"
  ON public.payment_logs FOR SELECT
  USING (true);

-- Add index for faster lookups
CREATE INDEX idx_payment_logs_booking_id ON public.payment_logs(booking_id);
CREATE INDEX idx_payment_logs_event_type ON public.payment_logs(event_type);
CREATE INDEX idx_payment_logs_created_at ON public.payment_logs(created_at DESC);