-- Create service_pricing table for centralized pricing management
CREATE TABLE public.service_pricing (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Allow public read access (prices should be visible to everyone)
CREATE POLICY "Anyone can view active service pricing"
ON public.service_pricing
FOR SELECT
USING (is_active = true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_service_pricing_updated_at
BEFORE UPDATE ON public.service_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial pricing data
INSERT INTO public.service_pricing (id, label, price, description, display_order) VALUES
  ('windows_upgrade', 'Windows Upgrade', 10, 'Upgrade to latest Windows version with all drivers configured', 1),
  ('software_repair', 'Software Repair', 10, 'Fix software issues, crashes, and application errors', 2),
  ('sound_issues', 'Sound Issues', 10, 'Resolve audio problems, driver issues, and speaker configuration', 3),
  ('network_setup', 'Network Setup', 10, 'WiFi configuration, network troubleshooting, and connectivity fixes', 4),
  ('virus_removal', 'Virus Removal', 10, 'Remove malware, viruses, and secure your system', 5),
  ('pc_optimization', 'PC Optimization', 10, 'Speed up your PC, clean junk files, and optimize performance', 6),
  ('data_recovery', 'Data Recovery', 10, 'Recover deleted files and restore lost data', 7),
  ('consultation', 'Consultation', 10, 'General tech consultation and advice', 8);