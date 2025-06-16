
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePostActions = (postId: string, authorUsername: string) => {
  const [actionStates, setActionStates] = useState({
    followed: false,
    saved: false,
    hidden: false,
    blocked: false
  });
  
  const [loading, setLoading] = useState({
    follow: false,
    save: false,
    share: false,
    report: false,
    hide: false,
    block: false,
    delete: false,
    edit: false
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

  // Charger les états initiaux
  useEffect(() => {
    const loadInitialStates = async () => {
      if (!user || !authorUsername) return;

      try {
        const authorId = await getUserIdByUsername(authorUsername);
        if (!authorId) return;

        // Vérifier le statut de suivi
        const { data: followData } = await supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', authorId)
          .maybeSingle();

        // Vérifier le statut de sauvegarde
        const { data: saveData } = await supabase
          .from('saved_posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

        // Vérifier le statut de masquage
        const { data: hideData } = await supabase
          .from('hidden_posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

        // Vérifier le statut de blocage
        const { data: blockData } = await supabase
          .from('blocked_users')
          .select('*')
          .eq('blocker_id', user.id)
          .eq('blocked_id', authorId)
          .maybeSingle();

        setActionStates({
          followed: !!followData,
          saved: !!saveData,
          hidden: !!hideData,
          blocked: !!blockData
        });
      } catch (error) {
        console.error('Error loading initial states:', error);
      }
    };

    loadInitialStates();
  }, [user, authorUsername, postId]);

  const followUser = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(prev => ({ ...prev, follow: true }));
    try {
      const targetUserId = await getUserIdByUsername(authorUsername);
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

        if (error) throw error;

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

        if (error) throw error;

        setActionStates(prev => ({ ...prev, followed: true }));
        toast.success('Utilisateur suivi avec succès');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Erreur lors de l\'opération');
    } finally {
      setLoading(prev => ({ ...prev, follow: false }));
    }
  };

  const savePost = async () => {
    if (!user) {
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

        if (error) throw error;

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

        if (error) throw error;

        setActionStates(prev => ({ ...prev, saved: true }));
        toast.success('Post sauvegardé');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const sharePost = async () => {
    setLoading(prev => ({ ...prev, share: true }));
    try {
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      const { error } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          share_type: 'direct'
        });

      if (error) throw error;
      toast.success('Post partagé avec succès');
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Erreur lors du partage');
    } finally {
      setLoading(prev => ({ ...prev, share: false }));
    }
  };

  const reportPost = async () => {
    setLoading(prev => ({ ...prev, report: true }));
    try {
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      // Vérifier si l'utilisateur a déjà signalé ce post
      const { data: existingReport } = await supabase
        .from('post_reports')
        .select('*')
        .eq('reporter_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (existingReport) {
        toast.info('Vous avez déjà signalé ce post');
        return;
      }

      const { error } = await supabase
        .from('post_reports')
        .insert({
          reporter_id: user.id,
          post_id: postId,
          reason: 'inappropriate_content',
          description: 'Signalement depuis l\'interface'
        });

      if (error) throw error;
      toast.success('Post signalé. Merci pour votre contribution à la sécurité de la communauté.');
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Erreur lors du signalement');
    } finally {
      setLoading(prev => ({ ...prev, report: false }));
    }
  };

  const hidePost = async () => {
    setLoading(prev => ({ ...prev, hide: true }));
    try {
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      if (actionStates.hidden) {
        // Unhide
        const { error } = await supabase
          .from('hidden_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;

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

        if (error) throw error;

        setActionStates(prev => ({ ...prev, hidden: true }));
        toast.success('Post masqué');
      }
    } catch (error) {
      console.error('Error hiding post:', error);
      toast.error('Erreur lors du masquage');
    } finally {
      setLoading(prev => ({ ...prev, hide: false }));
    }
  };

  const blockUser = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(prev => ({ ...prev, block: true }));
    try {
      const targetUserId = await getUserIdByUsername(authorUsername);
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

        if (error) throw error;

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

        if (error) throw error;

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
      console.error('Error blocking user:', error);
      toast.error('Erreur lors du blocage');
    } finally {
      setLoading(prev => ({ ...prev, block: false }));
    }
  };

  const deletePost = async () => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      if (!user) {
        toast.error('Vous devez être connecté');
        return false;
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const editPost = () => {
    toast.info('Fonctionnalité d\'édition en cours de développement');
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
