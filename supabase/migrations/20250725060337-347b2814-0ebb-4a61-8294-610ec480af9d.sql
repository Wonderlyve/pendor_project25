-- Create table to track post views per user
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all post views" 
ON public.post_views 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own post views" 
ON public.post_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add views column to posts table if not exists
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Function to increment post views
CREATE OR REPLACE FUNCTION public.increment_post_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts 
  SET views = views + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

-- Trigger to update post views count
DROP TRIGGER IF EXISTS increment_post_views_trigger ON public.post_views;
CREATE TRIGGER increment_post_views_trigger
  AFTER INSERT ON public.post_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_post_views();