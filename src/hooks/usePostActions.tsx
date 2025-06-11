
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePostActions = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const followUser = async (userId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        console.error('Error following user:', error);
        toast.error('Erreur lors du suivi');
        return;
      }

      toast.success('Utilisateur suivi avec succès');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du suivi');
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (postId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('saved_predictions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        toast.info('Post déjà sauvegardé');
        return;
      }

      const { error } = await supabase
        .from('saved_predictions')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) {
        console.error('Error saving post:', error);
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      toast.success('Post sauvegardé');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const reportPost = async (postId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Pour l'instant, on simule le signalement
    toast.success('Post signalé. Merci pour votre contribution à la sécurité de la communauté.');
  };

  const hidePost = async (postId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Pour l'instant, on simule le masquage
    toast.success('Post masqué');
  };

  const blockUser = async (userId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Pour l'instant, on simule le blocage
    toast.success('Utilisateur bloqué');
  };

  return {
    followUser,
    savePost,
    reportPost,
    hidePost,
    blockUser,
    loading
  };
};
