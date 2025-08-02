-- Create debriefings table
CREATE TABLE public.debriefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  creator_id UUID NOT NULL,
  channel_id UUID NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.debriefings ENABLE ROW LEVEL SECURITY;

-- Create policies for debriefings
CREATE POLICY "Débriefings visibles par les abonnés" 
ON public.debriefings 
FOR SELECT 
USING (
  (auth.uid() = creator_id) OR 
  (auth.uid() IN (
    SELECT channel_subscriptions.user_id
    FROM channel_subscriptions
    WHERE channel_subscriptions.channel_id = debriefings.channel_id 
    AND channel_subscriptions.is_active = true
  )) OR
  (auth.uid() IN (
    SELECT channels.creator_id
    FROM channels
    WHERE channels.id = debriefings.channel_id
  ))
);

CREATE POLICY "Créateurs peuvent créer des débriefings" 
ON public.debriefings 
FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id AND 
  auth.uid() IN (
    SELECT channels.creator_id
    FROM channels
    WHERE channels.id = debriefings.channel_id
  )
);

CREATE POLICY "Créateurs peuvent modifier leurs débriefings" 
ON public.debriefings 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Créateurs peuvent supprimer leurs débriefings" 
ON public.debriefings 
FOR DELETE 
USING (auth.uid() = creator_id);

-- Create debriefing_likes table
CREATE TABLE public.debriefing_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debriefing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(debriefing_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.debriefing_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for debriefing_likes
CREATE POLICY "Likes visibles par tous" 
ON public.debriefing_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Utilisateurs peuvent liker" 
ON public.debriefing_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent unliker" 
ON public.debriefing_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update debriefing likes count
CREATE OR REPLACE FUNCTION public.update_debriefing_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.debriefings 
    SET likes = likes + 1 
    WHERE id = NEW.debriefing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.debriefings 
    SET likes = likes - 1 
    WHERE id = OLD.debriefing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for debriefing likes count
CREATE TRIGGER update_debriefing_likes_count_trigger
  AFTER INSERT OR DELETE ON public.debriefing_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debriefing_likes_count();

-- Create trigger for updated_at
CREATE TRIGGER update_debriefings_updated_at
  BEFORE UPDATE ON public.debriefings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for debriefing videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('debriefing-videos', 'debriefing-videos', true);

-- Create storage policies for debriefing videos
CREATE POLICY "Vidéos débriefings accessibles publiquement" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'debriefing-videos');

CREATE POLICY "Créateurs peuvent uploader des vidéos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'debriefing-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Créateurs peuvent modifier leurs vidéos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'debriefing-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Créateurs peuvent supprimer leurs vidéos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'debriefing-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);