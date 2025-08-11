-- Créer une fonction pour générer des notifications quand un message est posté dans un canal
CREATE OR REPLACE FUNCTION public.create_channel_message_notifications()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Créer des notifications pour tous les abonnés actifs du canal
  INSERT INTO public.notifications (user_id, type, content, channel_id, from_user_id)
  SELECT 
    channel_subscriptions.user_id,
    'channel_message',
    (profiles.display_name COALESCE profiles.username COALESCE 'Un utilisateur') || ' a posté dans ' || channels.name,
    NEW.channel_id,
    NEW.user_id
  FROM public.channel_subscriptions
  JOIN public.channels ON channels.id = NEW.channel_id
  LEFT JOIN public.profiles ON profiles.user_id = NEW.user_id
  WHERE channel_subscriptions.channel_id = NEW.channel_id 
    AND channel_subscriptions.is_active = true
    AND channel_subscriptions.user_id != NEW.user_id; -- Ne pas notifier l'expéditeur
  
  RETURN NEW;
END;
$function$;

-- Créer le trigger pour les messages de canaux
CREATE TRIGGER on_channel_message_created
  AFTER INSERT ON public.channel_messages
  FOR EACH ROW EXECUTE FUNCTION public.create_channel_message_notifications();

-- Ajouter une colonne channel_id à la table notifications si elle n'existe pas
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS channel_id uuid REFERENCES public.channels(id);