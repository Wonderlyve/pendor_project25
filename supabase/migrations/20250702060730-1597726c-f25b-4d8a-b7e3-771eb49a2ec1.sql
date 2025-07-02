
-- Supprimer les triggers liés aux commentaires
DROP TRIGGER IF EXISTS update_comment_likes_count_trigger ON public.comment_likes;
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.comments;

-- Supprimer les fonctions liées aux commentaires
DROP FUNCTION IF EXISTS public.update_comment_likes_count();
DROP FUNCTION IF EXISTS public.update_post_comments_count();

-- Supprimer les tables des commentaires (dans l'ordre des dépendances)
DROP TABLE IF EXISTS public.comment_likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;

-- Retirer les tables des publications temps réel si elles existent
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.comments;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.comment_likes;
