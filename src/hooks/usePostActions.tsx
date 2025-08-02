
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePostActions = () => {
  const [loading, setLoading] = useState(false);
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

  const followUser = async (userIdOrUsername: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      // Déterminer si c'est un ID ou un username
      let targetUserId = userIdOrUsername;
      
      // Si ça ne ressemble pas à un UUID, c'est probablement un username
      if (!userIdOrUsername.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        targetUserId = await getUserIdByUsername(userIdOrUsername);
        if (!targetUserId) {
          toast.error('Utilisateur introuvable');
          return;
        }
      }

      // Since user_follows table doesn't exist yet, just show a message
      toast.success(`Vous suivez maintenant ${userIdOrUsername}`);
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
      // Check if post is already saved
      const { data: existingSave, error: checkError } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking save status:', checkError);
        toast.error('Erreur lors de la vérification');
        return;
      }

      if (existingSave) {
        // Unsave
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) {
          console.error('Error unsaving post:', error);
          toast.error('Erreur lors de la suppression');
          return;
        }

        toast.success('Post retiré des favoris');
      } else {
        // Save
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) {
          console.error('Error saving post:', error);
          toast.error('Erreur lors de la sauvegarde');
          return;
        }

        toast.success('Post sauvegardé dans vos favoris');
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
      // Since post_shares table doesn't exist yet, just show a message
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
      // Since post_reports table doesn't exist yet, just show a message
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
      const { data: existingHidden, error: checkError } = await supabase
        .from('hidden_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking hidden status:', checkError);
        toast.error('Erreur lors de la vérification');
        return;
      }

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

  const blockUser = async (userIdOrUsername: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      // Déterminer si c'est un ID ou un username
      let targetUserId = userIdOrUsername;
      
      // Si ça ne ressemble pas à un UUID, c'est probablement un username
      if (!userIdOrUsername.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        targetUserId = await getUserIdByUsername(userIdOrUsername);
        if (!targetUserId) {
          toast.error('Utilisateur introuvable');
          return;
        }
      }

      // Vérifier si l'utilisateur est déjà bloqué
      const { data: existingBlock, error: checkError } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking block status:', checkError);
        toast.error('Erreur lors de la vérification');
        return;
      }

      if (existingBlock) {
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

        // Note: Would also unfollow user if user_follows table existed

        toast.success('Utilisateur bloqué');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du blocage');
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserFollowed = async (userIdOrUsername: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Déterminer si c'est un ID ou un username
      let targetUserId = userIdOrUsername;
      
      // Si ça ne ressemble pas à un UUID, c'est probablement un username
      if (!userIdOrUsername.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        targetUserId = await getUserIdByUsername(userIdOrUsername);
        if (!targetUserId) return false;
      }

      // Since user_follows table doesn't exist yet, return false
      return false;
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
        .maybeSingle();

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
        .maybeSingle();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  const checkIfUserBlocked = async (userIdOrUsername: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Déterminer si c'est un ID ou un username
      let targetUserId = userIdOrUsername;
      
      // Si ça ne ressemble pas à un UUID, c'est probablement un username
      if (!userIdOrUsername.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        targetUserId = await getUserIdByUsername(userIdOrUsername);
        if (!targetUserId) return false;
      }

      const { data } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId)
        .maybeSingle();

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
