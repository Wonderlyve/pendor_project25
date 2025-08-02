-- Ajouter des colonnes pour supporter les briefs publics avec images d'aperçu
ALTER TABLE public.debriefings 
ADD COLUMN thumbnail_url text,
ADD COLUMN post_link text,
ADD COLUMN is_public boolean DEFAULT false;

-- Créer un index pour les briefs publics
CREATE INDEX idx_debriefings_public ON public.debriefings(is_public, created_at DESC) WHERE is_public = true;

-- Mettre à jour les politiques RLS pour permettre l'accès aux briefs publics
DROP POLICY IF EXISTS "Débriefings visibles par les abonnés" ON public.debriefings;

CREATE POLICY "Débriefings visibles par les abonnés et publics"
ON public.debriefings 
FOR SELECT 
USING (
  is_public = true OR 
  auth.uid() = creator_id OR 
  auth.uid() IN (
    SELECT channel_subscriptions.user_id
    FROM channel_subscriptions
    WHERE channel_subscriptions.channel_id = debriefings.channel_id 
    AND channel_subscriptions.is_active = true
  ) OR 
  auth.uid() IN (
    SELECT channels.creator_id
    FROM channels
    WHERE channels.id = debriefings.channel_id
  )
);

-- Mettre à jour la politique de création pour les briefs publics
DROP POLICY IF EXISTS "Créateurs peuvent créer des débriefings" ON public.debriefings;

CREATE POLICY "Créateurs peuvent créer des débriefings"
ON public.debriefings 
FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id AND (
    is_public = true OR 
    auth.uid() IN (
      SELECT channels.creator_id
      FROM channels
      WHERE channels.id = debriefings.channel_id
    )
  )
);