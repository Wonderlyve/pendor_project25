-- Add post_type column to posts table to distinguish between prediction and news posts
ALTER TABLE public.posts 
ADD COLUMN post_type TEXT DEFAULT 'prediction' CHECK (post_type IN ('prediction', 'news'));

-- Update the check constraint to make it more explicit
COMMENT ON COLUMN public.posts.post_type IS 'Type of post: prediction for betting posts, news for news posts';