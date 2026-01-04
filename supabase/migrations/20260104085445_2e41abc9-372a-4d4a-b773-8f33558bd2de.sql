-- Create products table (single source of truth for pricing)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (active = true);

-- Drop existing bookings table and recreate with new schema
DROP TABLE IF EXISTS public.bookings CASCADE;

-- Create bookings table with simplified schema
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  amount NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'processing',
  repair_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (public booking form)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view their booking by ID (for status page)
CREATE POLICY "Anyone can view bookings" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Insert default product
INSERT INTO public.products (name, price, active) 
VALUES ('Phone Repair Service', 150, true);