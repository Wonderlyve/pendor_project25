
-- Créer la table pour les canaux privés
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users NOT NULL,
  is_private BOOLEAN DEFAULT true,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les abonnements aux canaux
CREATE TABLE public.channel_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- Créer la table pour les messages des canaux
CREATE TABLE public.channel_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter les politiques RLS pour les canaux
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour les canaux
CREATE POLICY "Users can view channels they have access to" 
  ON public.channels 
  FOR SELECT 
  USING (
    NOT is_private OR 
    creator_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM channel_subscriptions 
      WHERE channel_id = id AND user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Pro users can create channels" 
  ON public.channels 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = creator_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND badge IN ('Pro', 'Expert')
    )
  );

CREATE POLICY "Creators can update their channels" 
  ON public.channels 
  FOR UPDATE 
  USING (creator_id = auth.uid());

-- Politiques pour les abonnements
CREATE POLICY "Users can view their own subscriptions" 
  ON public.channel_subscriptions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can subscribe to channels" 
  ON public.channel_subscriptions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Politiques pour les messages
CREATE POLICY "Users can view messages in subscribed channels" 
  ON public.channel_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      LEFT JOIN channel_subscriptions cs ON c.id = cs.channel_id
      WHERE c.id = channel_id AND (
        c.creator_id = auth.uid() OR
        (cs.user_id = auth.uid() AND cs.is_active = true) OR
        NOT c.is_private
      )
    )
  );

CREATE POLICY "Subscribed users can send messages" 
  ON public.channel_messages 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM channels c
      LEFT JOIN channel_subscriptions cs ON c.id = cs.channel_id
      WHERE c.id = channel_id AND (
        c.creator_id = auth.uid() OR
        (cs.user_id = auth.uid() AND cs.is_active = true)
      )
    )
  );

-- Assurer que les commentaires sont bien sauvegardés (vérification des contraintes)
ALTER TABLE public.comments 
  ALTER COLUMN content SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN post_id SET NOT NULL;
