-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT, -- 'image', 'video'
  location TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  duration INTEGER DEFAULT 86400, -- Duration in seconds (24h by default)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS on stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Stories are viewable by everyone" 
ON public.stories 
FOR SELECT 
USING (expires_at > now());

CREATE POLICY "Users can create their own stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
ON public.stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create story_views table
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Create policies for story_views
CREATE POLICY "Story views are viewable by everyone" 
ON public.story_views 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create story views" 
ON public.story_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create story_likes table
CREATE TABLE public.story_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_likes
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for story_likes
CREATE POLICY "Story likes are viewable by everyone" 
ON public.story_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like stories" 
ON public.story_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike stories" 
ON public.story_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create story_comments table
CREATE TABLE public.story_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_comments
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for story_comments
CREATE POLICY "Story comments are viewable by everyone" 
ON public.story_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create story comments" 
ON public.story_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story comments" 
ON public.story_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own story comments" 
ON public.story_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to increment story views
CREATE OR REPLACE FUNCTION public.increment_story_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stories 
  SET views = views + 1 
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for story views
CREATE TRIGGER update_story_views_count
  AFTER INSERT ON public.story_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_story_views();

-- Create function to update story likes count
CREATE OR REPLACE FUNCTION public.update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories 
    SET likes = likes + 1 
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories 
    SET likes = likes - 1 
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for story likes
CREATE TRIGGER update_story_likes_on_insert
  AFTER INSERT ON public.story_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_story_likes_count();

CREATE TRIGGER update_story_likes_on_delete
  AFTER DELETE ON public.story_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_story_likes_count();

-- Create function to update story comments count
CREATE OR REPLACE FUNCTION public.update_story_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories 
    SET comments = comments + 1 
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories 
    SET comments = comments - 1 
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for story comments
CREATE TRIGGER update_story_comments_on_insert
  AFTER INSERT ON public.story_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_story_comments_count();

CREATE TRIGGER update_story_comments_on_delete
  AFTER DELETE ON public.story_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_story_comments_count();

-- Create trigger for automatic timestamp updates on stories
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on story_comments
CREATE TRIGGER update_story_comments_updated_at
  BEFORE UPDATE ON public.story_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();