-- Create function to update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment comments count when a comment is added
    UPDATE posts 
    SET comments = COALESCE(comments, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement comments count when a comment is deleted
    UPDATE posts 
    SET comments = GREATEST(COALESCE(comments, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS trigger_update_post_comments_count_insert ON comments;
CREATE TRIGGER trigger_update_post_comments_count_insert
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Create trigger for DELETE operations
DROP TRIGGER IF EXISTS trigger_update_post_comments_count_delete ON comments;
CREATE TRIGGER trigger_update_post_comments_count_delete
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Update existing posts with correct comment counts
UPDATE posts 
SET comments = (
  SELECT COALESCE(COUNT(*), 0) 
  FROM comments 
  WHERE comments.post_id = posts.id
);