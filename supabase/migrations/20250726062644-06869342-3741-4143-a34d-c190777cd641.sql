-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "Seuls les pros peuvent créer des canaux" ON public.channels;

-- Créer une nouvelle politique permettant à tous de créer des canaux
CREATE POLICY "Tous peuvent créer des canaux" ON public.channels
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Créer une politique pour restreindre les canaux payants aux pros uniquement
CREATE POLICY "Seuls les pros peuvent créer des canaux payants" ON public.channels
FOR INSERT
WITH CHECK (
  auth.uid() = creator_id AND (
    price = 0 OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND (profiles.badge = 'Pro' OR profiles.badge = 'Expert')
    )
  )
);