-- Modifier la politique RLS pour permettre à tous les abonnés d'envoyer des messages
DROP POLICY IF EXISTS "Abonnés peuvent poster des messages" ON public.channel_messages;

CREATE POLICY "Abonnés peuvent poster des messages" 
ON public.channel_messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) AND 
  (
    auth.uid() IN (
      SELECT channel_subscriptions.user_id
      FROM channel_subscriptions
      WHERE channel_subscriptions.channel_id = channel_messages.channel_id 
      AND channel_subscriptions.is_active = true
    ) OR 
    auth.uid() IN (
      SELECT channels.creator_id
      FROM channels
      WHERE channels.id = channel_messages.channel_id
    )
  )
);

-- Ajouter des politiques pour la modification et suppression des messages
CREATE POLICY "Utilisateurs peuvent modifier leurs propres messages" 
ON public.channel_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs propres messages" 
ON public.channel_messages 
FOR DELETE 
USING (auth.uid() = user_id);