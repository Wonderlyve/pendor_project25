-- Ajouter la colonne match_time à la table posts pour stocker l'heure des matchs
ALTER TABLE public.posts 
ADD COLUMN match_time TIMESTAMP WITH TIME ZONE;