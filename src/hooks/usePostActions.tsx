
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActionStates {
  followed: boolean;
  saved: boolean;
  hidden: boolean;
  blocked: boolean;
}

interface LoadingStates {
  follow: boolean;
  save: boolean;
  block: boolean;
  delete: boolean;
  edit: boolean;
}

export const usePostActions = (postId?: string, username?: string) => {
  const [loading, setLoading] = useState<LoadingStates>({
    follow: false,
    save: false,
    block: false,
    delete: false,
    edit: false
  });
  
  const [actionStates, setActionStates] = useState<ActionStates>({
    followed: false,
    saved: false,
    hidden: false,
    blocked: false
  });

  const { user } = useAuth();

  // Fonction utilitaire pour obtenir l'ID utilisateur depuis le username
  const getUserIdByUsername = async (username: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error getting user ID:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  // Charger l'état initial des actions
  useEffect(() => {
    const loadActionStates = async () => {
      if (!user || !postId || !username) return;

      try {
        const targetUserId = await getUserIdByUsername(username);
        if (!targetUserId) return;

        // Vérifier si l'utilisateur suit cette personne
        const { data: followData } = await supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();

        // Vérifier si le post est sauvegardé
        const { data: savedData } = await supabase
          .from('saved_posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

        // Vérifier si le post est masqué
        const { data: hiddenData } = await supabase
          .from('hidden_posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

        // Vérifier si l'utilisateur est bloqué
        const { data: blockedData } = await supabase
          .from('blocked_users')
          .select('*')
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetUserId)
          .maybeSingle();

        setActionStates({
          followed: !!followData,
          saved: !!savedData,
          hidden: !!hiddenData,
          blocked: !!blockedData
        });
      } catch (error) {
        console.error('Error loading action states:', error);
      }
    };

    loadActionStates();
  }, [user, postId, username]);

  const followUser = async () => {
    if (!user || !username) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(prev => ({ ...prev, follow: true }));
    try {
      const targetUserId = await getUserIdByUsername(username);
      if (!targetUserId) {
        toast.error('Utilisateur introuvable');
        return;
      }

      if (actionStates.followed) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) {
          console.error('Error unfollowing user:', error);
          toast.error('Erreur lors du désabonnement');
          return;
        }

        setActionStates(prev => ({ ...prev, followed: false }));
        toast.success('Vous ne suivez plus cet utilisateur');
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) {
          console.error('Error following user:', error);
          toast.error('Erreur lors du suivi');
          return;
        }

        setActionStates(prev => ({ ...prev, followed: true }));
        toast.success('Utilisateur suivi avec succès');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'opération');
    } finally {
      setLoading(prev => ({ ...prev, follow: false }));
    }
  };

  const savePost = async () => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    try {
      if (actionStates.saved) {
        // Unsave
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unsaving post:', error);
          toast.error('Erreur lors de la suppression de la sauvegarde');
          return;
        }

        setActionStates(prev => ({ ...prev, saved: false }));
        toast.success('Post retiré des sauvegardes');
      } else {
        // Save
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          console.error('Error saving post:', error);
          toast.error('Erreur lors de la sauvegarde');
          return;
        }

        setActionStates(prev => ({ ...prev, saved: true }));
        toast.success('Post sauvegardé');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const sharePost = async () => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const { error } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          share_type: 'direct'
        });

      if (error) {
        console.error('Error sharing post:', error);
        toast.error('Erreur lors du partage');
        return;
      }

      toast.success('Post partagé avec succès');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du partage');
    }
  };

  const reportPost = async () => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      // Vérifier si l'utilisateur a déjà signalé ce post
      const { data: existingReport, error: checkError } = await supabase
        .from('post_reports')
        .select('*')
        .eq('reporter_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking report status:', checkError);
        toast.error('Erreur lors de la vérification');
        return;
      }

      if (existingReport) {
        toast.info('Vous avez déjà signalé ce post');
        return;
      }

      const { error } = await supabase
        .from('post_reports')
        .insert({
          reporter_id: user.id,
          post_id: postId,
          reason: 'inappropriate',
          description: 'Signalé depuis l\'application'
        });

      if (error) {
        console.error('Error reporting post:', error);
        toast.error('Erreur lors du signalement');
        return;
      }

      toast.success('Post signalé. Merci pour votre contribution à la sécurité de la communauté.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du signalement');
    }
  };

  const hidePost = async () => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      if (actionStates.hidden) {
        // Unhide
        const { error } = await supabase
          .from('hidden_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) {
          console.error('Error unhiding post:', error);
          toast.error('Erreur lors de l\'affichage du post');
          return;
        }

        setActionStates(prev => ({ ...prev, hidden: false }));
        toast.success('Post affiché de nouveau');
      } else {
        // Hide
        const { error } = await supabase
          .from('hidden_posts')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) {
          console.error('Error hiding post:', error);
          toast.error('Erreur lors du masquage');
          return;
        }

        setActionStates(prev => ({ ...prev, hidden: true }));
        toast.success('Post masqué');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du masquage');
    }
  };

  const blockUser = async () => {
    if (!user || !username) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(prev => ({ ...prev, block: true }));
    try {
      const targetUserId = await getUserIdByUsername(username);
      if (!targetUserId) {
        toast.error('Utilisateur introuvable');
        return;
      }

      if (actionStates.blocked) {
        // Unblock
        const { error } = await supabase
          .from('blocked_users')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetUserId);

        if (error) {
          console.error('Error unblocking user:', error);
          toast.error('Erreur lors du déblocage');
          return;
        }

        setActionStates(prev => ({ ...prev, blocked: false }));
        toast.success('Utilisateur débloqué');
      } else {
        // Block
        const { error } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: user.id,
            blocked_id: targetUserId
          });

        if (error) {
          console.error('Error blocking user:', error);
          toast.error('Erreur lors du blocage');
          return;
        }

        // Aussi unfollower l'utilisateur si on le suit
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        setActionStates(prev => ({ ...prev, blocked: true, followed: false }));
        toast.success('Utilisateur bloqué');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du blocage');
    } finally {
      setLoading(prev => ({ ...prev, block: false }));
    }
  };

  const deletePost = async (): Promise<boolean> => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté');
      return false;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting post:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const editPost = () => {
    // Pour l'instant, on affiche juste un message
    toast.info('Fonctionnalité de modification en cours de développement');
  };

  return {
    actionStates,
    loading,
    followUser,
    savePost,
    sharePost,
    reportPost,
    hidePost,
    blockUser,
    deletePost,
    editPost
  };
};
