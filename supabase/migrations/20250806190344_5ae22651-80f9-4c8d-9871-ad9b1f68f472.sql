-- Créer une table simple pour les posts de mise à jour
CREATE TABLE public.update_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  version_name TEXT NOT NULL,
  description TEXT,
  update_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.update_posts ENABLE ROW LEVEL SECURITY;

-- Policies pour les posts de mise à jour
CREATE POLICY "Tout le monde peut voir les posts de mise à jour actifs" 
ON public.update_posts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Seuls les utilisateurs autorisés peuvent créer des posts de mise à jour" 
ON public.update_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Seuls les créateurs peuvent modifier leurs posts de mise à jour" 
ON public.update_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fonction pour update_updated_at si elle n'existe pas déjà
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les timestamps
CREATE TRIGGER update_update_posts_updated_at
  BEFORE UPDATE ON public.update_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();