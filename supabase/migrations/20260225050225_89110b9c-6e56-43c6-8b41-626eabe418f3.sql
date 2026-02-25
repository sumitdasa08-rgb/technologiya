
-- Add views column to blogs table
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- Create blog_reactions table
CREATE TABLE public.blog_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id uuid NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('🔥', '👍', '🤯', '❤️', '🤔')),
  user_fingerprint text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(blog_id, reaction, user_fingerprint)
);

ALTER TABLE public.blog_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.blog_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reactions" ON public.blog_reactions FOR INSERT WITH CHECK (true);

CREATE INDEX idx_blog_reactions_blog_id ON public.blog_reactions(blog_id);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id uuid NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  name text NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.blog_comments FOR INSERT WITH CHECK (true);

CREATE INDEX idx_blog_comments_blog_id ON public.blog_comments(blog_id);
