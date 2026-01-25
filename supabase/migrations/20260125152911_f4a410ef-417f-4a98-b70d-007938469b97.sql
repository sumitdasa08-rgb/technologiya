-- Add email column to bookings table (optional field)
ALTER TABLE public.bookings ADD COLUMN email text;

-- Add email format validation constraint
ALTER TABLE public.bookings ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');