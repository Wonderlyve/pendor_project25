-- Ajouter le champ bet_type à la table posts
ALTER TABLE public.posts 
ADD COLUMN bet_type TEXT DEFAULT '1X2';