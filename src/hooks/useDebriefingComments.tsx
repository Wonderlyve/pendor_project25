import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DebriefingComment {
  id: string;
  debriefing_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
  // Données jointes
  user_username?: string;
  user_avatar?: string;
  isLiked?: boolean;
  replies?: DebriefingComment[];
}

export const useDebriefingComments = (debriefingId?: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<DebriefingComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!debriefingId) return;

    try {
      setLoading(true);
      
      // Récupérer les commentaires
      const { data: commentsData, error } = await supabase
        .from('debriefing_comments')
        .select('*')
        .eq('debriefing_id', debriefingId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Récupérer les données des profils utilisateurs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);

      if (error) throw error;

      // Récupérer les likes si l'utilisateur est connecté
      let likesData: any[] = [];
      if (user) {
        const { data: likes, error: likesError } = await supabase
          .from('debriefing_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsData.map(c => c.id));

        if (!likesError) {
          likesData = likes;
        }
      }

      // Transformer les données et organiser en hiérarchie
      const transformedComments = commentsData.map(comment => {
        const userProfile = profilesData?.find(p => p.user_id === comment.user_id);
        return {
          ...comment,
          user_username: userProfile?.username || 'Utilisateur anonyme',
          user_avatar: userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`,
          isLiked: likesData.some(like => like.comment_id === comment.id),
          replies: []
        };
      });

      // Organiser en hiérarchie (commentaires parents et réponses)
      const parentComments = transformedComments.filter(c => !c.parent_id);
      const childComments = transformedComments.filter(c => c.parent_id);

      parentComments.forEach(parent => {
        parent.replies = childComments.filter(child => child.parent_id === parent.id);
      });

      setComments(parentComments);
    } catch (error: any) {
      console.error('Error fetching debriefing comments:', error);
    } finally {
      setLoading(false);
    }
  }, [debriefingId, user]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!user || !debriefingId) return false;

    try {
      const { error } = await supabase
        .from('debriefing_comments')
        .insert({
          debriefing_id: debriefingId,
          user_id: user.id,
          parent_id: parentId,
          content
        });

      if (error) throw error;

      // Recharger les commentaires
      await fetchComments();
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      return false;
    }
  }, [user, debriefingId, fetchComments]);

  const likeComment = useCallback(async (commentId: string) => {
    if (!user) return false;

    try {
      // Vérifier si déjà liké
      const { data: existingLike } = await supabase
        .from('debriefing_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unliker
        await supabase
          .from('debriefing_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Liker
        await supabase
          .from('debriefing_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }

      // Recharger les commentaires
      await fetchComments();
      return true;
    } catch (error: any) {
      console.error('Error liking comment:', error);
      return false;
    }
  }, [user, fetchComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('debriefing_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Recharger les commentaires
      await fetchComments();
      return true;
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }, [user, fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!debriefingId) return;

    const channel = supabase
      .channel(`debriefing-comments-${debriefingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debriefing_comments',
          filter: `debriefing_id=eq.${debriefingId}`
        },
        () => {
          fetchComments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debriefing_comment_likes'
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debriefingId, fetchComments]);

  return {
    comments,
    loading,
    addComment,
    likeComment,
    deleteComment,
    refetch: fetchComments
  };
};