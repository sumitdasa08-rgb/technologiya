-- Add location column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN location TEXT DEFAULT NULL;