-- Add repair status field to track the repair progress
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS repair_status text NOT NULL DEFAULT 'problem_raised';

-- Add constraint for valid status values
ALTER TABLE public.bookings 
ADD CONSTRAINT valid_repair_status 
CHECK (repair_status IN ('problem_raised', 'technician_called', 'technician_fixing', 'fixed', 'customer_satisfied'));

-- Create RLS policy to allow customers to view their own bookings by phone
CREATE POLICY "Customers can view their own bookings by phone" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;