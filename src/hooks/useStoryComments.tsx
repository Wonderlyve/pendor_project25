import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  } | null;
}

export const useStoryComments = (storyId: string) => {
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data: commentsData, error: commentsError } = await supabase
        .from('story_comments')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Récupérer les profils utilisateur
      const userIds = commentsData?.map(comment => comment.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      // Joindre les données
      const commentsWithProfiles = commentsData?.map(comment => ({
        ...comment,
        profiles: profilesData?.find(profile => profile.user_id === comment.user_id) || null,
      })) || [];

      setComments(commentsWithProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: newComment, error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          user_id: user.id,
          content,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Récupérer le profil de l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const commentWithProfile = {
        ...newComment,
        profiles: profile || null,
      };
      
      setComments(prev => [...prev, commentWithProfile]);
      return commentWithProfile;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire');
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('story_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression du commentaire');
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchComments();
    }
  }, [storyId]);

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
};