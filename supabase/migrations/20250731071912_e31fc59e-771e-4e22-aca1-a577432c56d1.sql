-- Créer la table pour les commentaires de débriefings
CREATE TABLE public.debriefing_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debriefing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID NULL, -- Pour les réponses
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.debriefing_comments ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Commentaires de débriefings visibles par tous" 
ON public.debriefing_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Utilisateurs peuvent créer des commentaires" 
ON public.debriefing_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs commentaires" 
ON public.debriefing_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs commentaires" 
ON public.debriefing_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Créer la table pour les likes de commentaires de débriefings
CREATE TABLE public.debriefing_comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Activer RLS
ALTER TABLE public.debriefing_comment_likes ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Likes de commentaires visibles par tous" 
ON public.debriefing_comment_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Utilisateurs peuvent liker des commentaires" 
ON public.debriefing_comment_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent unliker leurs commentaires" 
ON public.debriefing_comment_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Créer les fonctions pour mettre à jour les compteurs
CREATE OR REPLACE FUNCTION public.update_debriefing_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.debriefing_comments 
    SET likes = likes + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.debriefing_comments 
    SET likes = likes - 1 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
CREATE TRIGGER update_debriefing_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON public.debriefing_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debriefing_comment_likes_count();

-- Trigger pour updated_at
CREATE TRIGGER update_debriefing_comments_updated_at
  BEFORE UPDATE ON public.debriefing_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter un compteur de commentaires à la table debriefings
ALTER TABLE public.debriefings 
ADD COLUMN comments INTEGER NOT NULL DEFAULT 0;

-- Créer une fonction pour mettre à jour le compteur de commentaires
CREATE OR REPLACE FUNCTION public.update_debriefing_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.debriefings 
    SET comments = comments + 1 
    WHERE id = NEW.debriefing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.debriefings 
    SET comments = comments - 1 
    WHERE id = OLD.debriefing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour le compteur de commentaires
CREATE TRIGGER update_debriefing_comments_count_trigger
  AFTER INSERT OR DELETE ON public.debriefing_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debriefing_comments_count();