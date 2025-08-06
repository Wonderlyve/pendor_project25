-- Créer la table des notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  post_id UUID NULL,
  from_user_id UUID NULL
);

-- Activer Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Créer une fonction pour créer des notifications pour les followers
CREATE OR REPLACE FUNCTION public.create_follower_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer des notifications pour tous les followers de l'utilisateur qui a créé le post
  INSERT INTO public.notifications (user_id, type, content, post_id, from_user_id)
  SELECT 
    follows.follower_id,
    'new_post',
    profiles.display_name || ' a publié un nouveau pronostic',
    NEW.id,
    NEW.user_id
  FROM public.follows
  JOIN public.profiles ON profiles.user_id = NEW.user_id
  WHERE follows.following_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour automatiquement créer des notifications lors de la création d'un post
CREATE TRIGGER create_post_notifications
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follower_notifications();

-- Activer les updates en temps réel pour la table notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;