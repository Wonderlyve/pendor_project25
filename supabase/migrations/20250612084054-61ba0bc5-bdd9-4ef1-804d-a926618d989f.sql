
-- Table pour suivre les utilisateurs
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Table pour sauvegarder les posts
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Table pour partager les posts
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  share_type TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'social', 'link'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour signaler les posts
CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL, -- 'spam', 'inappropriate', 'fake', 'harassment', 'other'
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reporter_id, post_id)
);

-- Table pour masquer les posts
CREATE TABLE IF NOT EXISTS public.hidden_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Table pour bloquer les utilisateurs
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_follows
CREATE POLICY "Users can view follows" 
  ON public.user_follows 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can follow others" 
  ON public.user_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
  ON public.user_follows 
  FOR DELETE 
  USING (auth.uid() = follower_id);

-- Politiques RLS pour saved_posts
CREATE POLICY "Users can view their saved posts" 
  ON public.saved_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
  ON public.saved_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
  ON public.saved_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Politiques RLS pour post_shares
CREATE POLICY "Users can view their shares" 
  ON public.post_shares 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can share posts" 
  ON public.post_shares 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour post_reports
CREATE POLICY "Users can view their own reports" 
  ON public.post_reports 
  FOR SELECT 
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can report posts" 
  ON public.post_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their reports" 
  ON public.post_reports 
  FOR UPDATE 
  USING (auth.uid() = reporter_id);

-- Politiques RLS pour hidden_posts
CREATE POLICY "Users can view their hidden posts" 
  ON public.hidden_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can hide posts" 
  ON public.hidden_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unhide posts" 
  ON public.hidden_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Politiques RLS pour blocked_users
CREATE POLICY "Users can view their blocked users" 
  ON public.blocked_users 
  FOR SELECT 
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others" 
  ON public.blocked_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock users" 
  ON public.blocked_users 
  FOR DELETE 
  USING (auth.uid() = blocker_id);

-- Fonction pour mettre à jour le compteur de partages
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET shares = shares + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET shares = shares - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger pour mettre à jour automatiquement le compteur de partages
CREATE TRIGGER update_post_shares_count_trigger
  AFTER INSERT OR DELETE ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_count();

-- Fonction pour mettre à jour les compteurs de followers
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrémenter le compteur de followers pour l'utilisateur suivi
    UPDATE public.profiles 
    SET followers_count = COALESCE(followers_count, 0) + 1 
    WHERE id = NEW.following_id;
    
    -- Incrémenter le compteur de following pour le follower
    UPDATE public.profiles 
    SET following_count = COALESCE(following_count, 0) + 1 
    WHERE id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Décrémenter le compteur de followers
    UPDATE public.profiles 
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
    WHERE id = OLD.following_id;
    
    -- Décrémenter le compteur de following
    UPDATE public.profiles 
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) 
    WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger pour mettre à jour automatiquement les compteurs de follow
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Activer les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hidden_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_users;
