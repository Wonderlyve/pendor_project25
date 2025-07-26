-- Créer la table des canaux VIP
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT true,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des abonnements aux canaux
CREATE TABLE public.channel_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(channel_id, user_id)
);

-- Créer la table des messages de canaux
CREATE TABLE public.channel_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour channels
CREATE POLICY "Canaux visibles par tous" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Seuls les pros peuvent créer des canaux" ON public.channels 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (badge = 'Pro' OR badge = 'Expert')
    )
  );
CREATE POLICY "Créateurs peuvent modifier leurs canaux" ON public.channels 
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Créateurs peuvent supprimer leurs canaux" ON public.channels 
  FOR DELETE USING (auth.uid() = creator_id);

-- Politiques RLS pour channel_subscriptions
CREATE POLICY "Abonnements visibles par les participants" ON public.channel_subscriptions 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT creator_id FROM public.channels WHERE id = channel_id)
  );
CREATE POLICY "Utilisateurs peuvent s'abonner" ON public.channel_subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent se désabonner" ON public.channel_subscriptions 
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent modifier leurs abonnements" ON public.channel_subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques RLS pour channel_messages
CREATE POLICY "Messages visibles par les abonnés" ON public.channel_messages 
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.channel_subscriptions 
      WHERE channel_id = channel_messages.channel_id AND is_active = true
    ) OR
    auth.uid() IN (
      SELECT creator_id FROM public.channels 
      WHERE id = channel_messages.channel_id
    )
  );
CREATE POLICY "Abonnés peuvent poster des messages" ON public.channel_messages 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      auth.uid() IN (
        SELECT user_id FROM public.channel_subscriptions 
        WHERE channel_id = channel_messages.channel_id AND is_active = true
      ) OR
      auth.uid() IN (
        SELECT creator_id FROM public.channels 
        WHERE id = channel_messages.channel_id
      )
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();