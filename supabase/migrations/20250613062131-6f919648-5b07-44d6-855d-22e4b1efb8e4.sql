
-- Créer une fonction pour notifier les followers lors d'un nouveau post
CREATE OR REPLACE FUNCTION public.notify_followers_new_prediction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, content, post_id, read)
  SELECT 
    followers.follower_id,
    'new_prediction',
    CONCAT(
      (SELECT username FROM profiles WHERE id = NEW.user_id),
      ' a publié un nouveau pronostic'
    ),
    NEW.id,
    false
  FROM user_follows as followers
  WHERE followers.following_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour notifier automatiquement lors d'un nouveau post
DROP TRIGGER IF EXISTS notify_followers_on_new_post ON public.posts;
CREATE TRIGGER notify_followers_on_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_followers_new_prediction();

-- Activer les mises à jour en temps réel pour les notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
