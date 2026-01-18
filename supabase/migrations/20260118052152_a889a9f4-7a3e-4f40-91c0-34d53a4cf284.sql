-- Add short_ref column to bookings table
ALTER TABLE public.bookings ADD COLUMN short_ref TEXT;

-- Create a unique index on short_ref for fast lookups
CREATE UNIQUE INDEX idx_bookings_short_ref ON public.bookings(short_ref);

-- Create a function to generate short reference numbers
CREATE OR REPLACE FUNCTION public.generate_short_ref()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate 8-character reference from the UUID
  NEW.short_ref := UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate short_ref on insert
CREATE TRIGGER set_booking_short_ref
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.generate_short_ref();

-- Update existing bookings with short_ref
UPDATE public.bookings 
SET short_ref = UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
WHERE short_ref IS NULL;