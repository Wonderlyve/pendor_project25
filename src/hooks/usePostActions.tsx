
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
      // Vérifier si l'utilisateur suit déjà cette personne
      const { data: existingFollow } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) {
          console.error('Error unfollowing user:', error);
          toast.error('Erreur lors du désabonnement');
          return;
        }

        toast.success('Vous ne suivez plus cet utilisateur');
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
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
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'opération');
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
      // Vérifier si le post est déjà sauvegardé
      const { data: existingSave } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingSave) {
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

        toast.success('Post sauvegardé');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const sharePost = async (postId: string, shareType: string = 'direct') => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          share_type: shareType
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
    } finally {
      setLoading(false);
    }
  };

  const reportPost = async (postId: string, reason: string, description?: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      // Vérifier si l'utilisateur a déjà signalé ce post
      const { data: existingReport } = await supabase
        .from('post_reports')
        .select('*')
        .eq('reporter_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingReport) {
        toast.info('Vous avez déjà signalé ce post');
        return;
      }

      const { error } = await supabase
        .from('post_reports')
        .insert({
          reporter_id: user.id,
          post_id: postId,
          reason: reason,
          description: description
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
    } finally {
      setLoading(false);
    }
  };

  const hidePost = async (postId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      // Vérifier si le post est déjà masqué
      const { data: existingHidden } = await supabase
        .from('hidden_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingHidden) {
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

        toast.success('Post masqué');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du masquage');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      // Vérifier si l'utilisateur est déjà bloqué
      const { data: existingBlock } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .single();

      if (existingBlock) {
        // Unblock
        const { error } = await supabase
          .from('blocked_users')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', userId);

        if (error) {
          console.error('Error unblocking user:', error);
          toast.error('Erreur lors du déblocage');
          return;
        }

        toast.success('Utilisateur débloqué');
      } else {
        // Block
        const { error } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: user.id,
            blocked_id: userId
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
          .eq('following_id', userId);

        toast.success('Utilisateur bloqué');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du blocage');
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserFollowed = async (userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  const checkIfPostSaved = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  const checkIfPostHidden = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('hidden_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  const checkIfUserBlocked = async (userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  return {
    followUser,
    savePost,
    sharePost,
    reportPost,
    hidePost,
    blockUser,
    checkIfUserFollowed,
    checkIfPostSaved,
    checkIfPostHidden,
    checkIfUserBlocked,
    loading
  };
};
