import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ScoredPost {
  id: string;
  user_id: string;
  content: string;
  sport?: string;
  match_teams?: string;
  prediction_text?: string;
  analysis?: string;
  odds: number;
  confidence: number;
  image_url?: string;
  video_url?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  created_at: string;
  match_time?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  badge?: string;
  like_count?: number;
  visibility_score?: number;
  community_score?: number;
  personalized_score?: number;
  boost_count?: number;
  is_boosted?: boolean;
}

export const useClassement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Calculer le score de visibilité d'un post
  const calculateVisibilityScore = useCallback(async (postId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-visibility-score', {
        body: { postId }
      });

      if (error) {
        console.error('Error calculating visibility score:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }, []);

  // Récupérer le feed personnalisé "Pour Toi"
  const getPersonalizedFeed = useCallback(async (limit = 20, offset = 0): Promise<ScoredPost[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-personalized-feed', {
        body: { userId: user.id, limit, offset }
      });

      if (error) {
        console.error('Error fetching personalized feed:', error);
        toast.error('Erreur lors du chargement du feed personnalisé');
        return [];
      }

      return data?.posts || [];
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement du feed personnalisé');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Récupérer le feed communautaire
  const getCommunityFeed = useCallback(async (limit = 20, offset = 0, timeframe = '24h'): Promise<ScoredPost[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-community-feed', {
        body: { limit, offset, timeframe }
      });

      if (error) {
        console.error('Error fetching community feed:', error);
        toast.error('Erreur lors du chargement du feed communautaire');
        return [];
      }

      return data?.posts || [];
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement du feed communautaire');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les nouveaux pronos (tri chronologique)
  const getNewPredictions = useCallback(async (limit = 20, offset = 0): Promise<ScoredPost[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            badge
          ),
          post_scores (
            visibility_score
          ),
          post_boosts (
            boost_count:id.count()
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching new predictions:', error);
        toast.error('Erreur lors du chargement des nouveaux pronos');
        return [];
      }

      // Vérifier les boosts de l'utilisateur si connecté
      let userBoosts: string[] = [];
      if (user && data && data.length > 0) {
        const postIds = data.map(post => post.id);
        const { data: boostData } = await supabase
          .from('post_boosts')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        userBoosts = boostData?.map(boost => boost.post_id) || [];
      }

      const transformedPosts: ScoredPost[] = data?.map((post: any) => ({
        ...post,
        username: post.profiles?.username,
        display_name: post.profiles?.display_name,
        avatar_url: post.profiles?.avatar_url,
        badge: post.profiles?.badge,
        like_count: post.likes,
        visibility_score: post.post_scores?.[0]?.visibility_score || 50,
        boost_count: post.post_boosts?.[0]?.boost_count || 0,
        is_boosted: userBoosts.includes(post.id)
      })) || [];

      return transformedPosts;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des nouveaux pronos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Booster ou débooster un post
  const toggleBoostPost = useCallback(async (postId: string, currentlyBoosted: boolean) => {
    if (!user) {
      toast.error('Vous devez être connecté pour booster un post');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('boost-prediction', {
        body: { 
          postId, 
          action: currentlyBoosted ? 'unboost' : 'boost' 
        }
      });

      if (error) {
        console.error('Error toggling boost:', error);
        if (error.message?.includes('Daily boost limit reached')) {
          toast.error(`Limite de boosts quotidiens atteinte`);
        } else {
          toast.error('Erreur lors du boost');
        }
        return false;
      }

      if (currentlyBoosted) {
        toast.success('Boost retiré');
      } else {
        toast.success(`Post boosté ! ${data.remainingBoosts || 0} boosts restants aujourd'hui`);
      }
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du boost');
      return false;
    }
  }, [user]);

  // Signaler un post
  const reportPost = useCallback(async (postId: string, reason: string, description?: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour signaler un post');
      return false;
    }

    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          user_id: user.id,
          reason,
          description
        });

      if (error) {
        console.error('Error reporting post:', error);
        if (error.code === '23505') {
          toast.error('Vous avez déjà signalé ce post');
        } else {
          toast.error('Erreur lors du signalement');
        }
        return false;
      }

      toast.success('Post signalé avec succès');
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du signalement');
      return false;
    }
  }, [user]);

  // Mettre à jour les badges (fonction administrative)
  const updateBadges = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-badges', {
        body: { action: 'update_all' }
      });

      if (error) {
        console.error('Error updating badges:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }, []);

  return {
    loading,
    calculateVisibilityScore,
    getPersonalizedFeed,
    getCommunityFeed,
    getNewPredictions,
    toggleBoostPost,
    reportPost,
    updateBadges
  };
};