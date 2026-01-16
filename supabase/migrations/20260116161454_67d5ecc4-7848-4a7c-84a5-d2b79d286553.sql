-- Add service_id column to bookings table to track which service was selected
ALTER TABLE public.bookings ADD COLUMN service_id text;