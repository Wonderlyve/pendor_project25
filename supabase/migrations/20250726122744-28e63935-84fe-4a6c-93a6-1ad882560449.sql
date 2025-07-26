-- Créer une table pour les pronostiques VIP des canaux
CREATE TABLE public.vip_pronos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  total_odds NUMERIC NOT NULL,
  image_url TEXT,
  description TEXT NOT NULL,
  prediction_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.vip_pronos ENABLE ROW LEVEL SECURITY;

-- Politique pour voir les pronos VIP (abonnés du canal)
CREATE POLICY "Pronos VIP visibles par les abonnés"
ON public.vip_pronos
FOR SELECT
USING (
  -- Créateur du canal peut toujours voir
  auth.uid() = creator_id OR
  -- Abonnés actifs du canal peuvent voir
  auth.uid() IN (
    SELECT user_id 
    FROM channel_subscriptions 
    WHERE channel_subscriptions.channel_id = vip_pronos.channel_id 
    AND channel_subscriptions.is_active = true
  )
);

-- Politique pour créer des pronos VIP (créateur du canal uniquement)
CREATE POLICY "Créateurs peuvent créer des pronos VIP"
ON public.vip_pronos
FOR INSERT
WITH CHECK (
  auth.uid() = creator_id AND
  auth.uid() IN (
    SELECT creator_id 
    FROM channels 
    WHERE channels.id = vip_pronos.channel_id
  )
);

-- Politique pour modifier des pronos VIP (créateur uniquement)
CREATE POLICY "Créateurs peuvent modifier leurs pronos VIP"
ON public.vip_pronos
FOR UPDATE
USING (auth.uid() = creator_id);

-- Politique pour supprimer des pronos VIP (créateur uniquement)
CREATE POLICY "Créateurs peuvent supprimer leurs pronos VIP"
ON public.vip_pronos
FOR DELETE
USING (auth.uid() = creator_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_vip_pronos_updated_at
BEFORE UPDATE ON public.vip_pronos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();