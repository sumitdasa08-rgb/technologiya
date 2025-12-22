-- Add description column to store "Describe Your Issue" text
ALTER TABLE public.bookings 
ADD COLUMN description TEXT;