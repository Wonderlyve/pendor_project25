-- Créer les tables pour le système de classement et scoring

-- Table pour stocker les scores de visibilité des posts
CREATE TABLE IF NOT EXISTS public.post_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visibility_score numeric(5,2) NOT NULL DEFAULT 50.00,
  content_quality_score numeric(5,2) NOT NULL DEFAULT 0.00,
  engagement_score numeric(5,2) NOT NULL DEFAULT 0.00,
  author_reliability_score numeric(5,2) NOT NULL DEFAULT 50.00,
  freshness_score numeric(5,2) NOT NULL DEFAULT 100.00,
  report_penalty numeric(5,2) NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id)
);

-- Table pour les boosts/recommandations des posts
CREATE TABLE IF NOT EXISTS public.post_boosts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  boost_type text NOT NULL DEFAULT 'user_boost',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Table pour les signalements de posts
CREATE TABLE IF NOT EXISTS public.post_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Table pour les préférences utilisateur
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  favorite_sports text[],
  favorite_bet_types text[],
  notification_settings jsonb DEFAULT '{}',
  feed_preferences jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.post_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour post_scores
CREATE POLICY "Post scores are viewable by everyone" ON public.post_scores
FOR SELECT USING (true);

CREATE POLICY "System can manage post scores" ON public.post_scores
FOR ALL USING (true);

-- Politiques RLS pour post_boosts
CREATE POLICY "Post boosts are viewable by everyone" ON public.post_boosts
FOR SELECT USING (true);

CREATE POLICY "Users can boost posts" ON public.post_boosts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their boosts" ON public.post_boosts
FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour post_reports
CREATE POLICY "Users can report posts" ON public.post_reports
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" ON public.post_reports
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage reports" ON public.post_reports
FOR ALL USING (true);

-- Politiques RLS pour user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
FOR ALL USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_post_scores_post_id ON public.post_scores(post_id);
CREATE INDEX IF NOT EXISTS idx_post_scores_visibility ON public.post_scores(visibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_post_boosts_post_id ON public.post_boosts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_boosts_user_id ON public.post_boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables nécessaires
CREATE TRIGGER update_post_scores_updated_at 
    BEFORE UPDATE ON public.post_scores 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();