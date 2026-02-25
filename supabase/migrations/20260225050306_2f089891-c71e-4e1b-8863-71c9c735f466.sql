
CREATE OR REPLACE FUNCTION public.increment_blog_views(p_blog_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_views integer;
BEGIN
  UPDATE blogs SET views = views + 1 WHERE id = p_blog_id RETURNING views INTO new_views;
  RETURN new_views;
END;
$$;
