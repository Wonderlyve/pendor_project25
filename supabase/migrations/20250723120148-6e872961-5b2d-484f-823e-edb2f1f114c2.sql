-- Create trigger function to update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes = likes + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes = likes - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for post likes
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_likes_count();

-- Update existing post likes counts to ensure accuracy
UPDATE public.posts 
SET likes = (
  SELECT COUNT(*) 
  FROM public.post_likes 
  WHERE post_likes.post_id = posts.id
);

-- Update existing comment likes counts to ensure accuracy  
UPDATE public.comments 
SET likes = (
  SELECT COUNT(*) 
  FROM public.comment_likes 
  WHERE comment_likes.comment_id = comments.id
);

-- Update existing post comments counts to ensure accuracy
UPDATE public.posts 
SET comments = (
  SELECT COUNT(*) 
  FROM public.comments 
  WHERE comments.post_id = posts.id
);