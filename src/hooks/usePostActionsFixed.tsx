
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePostActionsFixed = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getUserIdByUsername = async (username: string): Promise<string | null> => {
    try {
      // Utiliser maybeSingle() pour éviter l'erreur PGRST116
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user ID:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in getUserIdByUsername:', error);
      return null;
    }
  };

  const savePost = async (postId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!postId || postId === 'undefined' || postId === 'NaN') {
      console.error('Invalid post ID for save:', postId);
      toast.error('ID de post invalide');
      return;
    }

    setLoading(true);
    try {
      // Vérifier si le post est déjà sauvegardé
      const { data: existingSave, error: checkError } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
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
          if (error.code === '23505') {
            toast.error('Post déjà sauvegardé');
          } else {
            toast.error('Erreur lors de la sauvegarde');
          }
          return;
        }

        toast.success('Post sauvegardé');
      }
    } catch (error) {
      console.error('Error in savePost:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const checkIfPostSaved = async (postId: string): Promise<boolean> => {
    if (!user || !postId || postId === 'undefined' || postId === 'NaN') return false;

    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if post saved:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkIfPostSaved:', error);
      return false;
    }
  };

  return {
    savePost,
    checkIfPostSaved,
    loading,
    getUserIdByUsername
  };
};
