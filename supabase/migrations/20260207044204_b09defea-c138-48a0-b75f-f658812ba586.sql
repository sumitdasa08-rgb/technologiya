
-- Create storage bucket for blog cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-covers', 'blog-covers', true);

-- Allow anyone to view blog cover images
CREATE POLICY "Public read access for blog covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

-- Allow service role to upload blog covers
CREATE POLICY "Service role can upload blog covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-covers' AND auth.role() = 'service_role');

-- Allow service role to update/delete blog covers
CREATE POLICY "Service role can manage blog covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-covers' AND auth.role() = 'service_role');
