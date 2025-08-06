-- Permettre les valeurs NULL pour video_url dans la table debriefings
-- car un débriefing peut être créé sans vidéo
ALTER TABLE public.debriefings 
ALTER COLUMN video_url DROP NOT NULL;