
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  likes: number;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  badge?: string;
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            badge
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        toast.error('Erreur lors du chargement des commentaires');
        return;
      }

      const transformedComments = data?.map((comment: any) => ({
        ...comment,
        username: comment.profiles?.username,
        display_name: comment.profiles?.display_name,
        avatar_url: comment.profiles?.avatar_url,
        badge: comment.profiles?.badge,
      })) || [];

      // Organiser les commentaires avec leurs réponses
      const rootComments = transformedComments.filter((comment: Comment) => !comment.parent_id);
      const commentsWithReplies = rootComments.map((comment: Comment) => ({
        ...comment,
        replies: transformedComments.filter((reply: Comment) => reply.parent_id === comment.id)
      }));

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour commenter');
      return null;
    }

    if (!content.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content: content.trim(),
          parent_id: parentId,
          likes: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        toast.error('Erreur lors de la création du commentaire');
        return null;
      }

      // Rafraîchir les commentaires
      fetchComments();
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la création du commentaire');
      return null;
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker un commentaire');
      return;
    }

    try {
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unliking comment:', error);
          return;
        }
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (error) {
          console.error('Error liking comment:', error);
          return;
        }
      }

      fetchComments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Écouter les mises à jour en temps réel avec un nom de canal unique
  useEffect(() => {
    if (!postId) return;

    const channelName = `comments-${postId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Comment change:', payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [postId]); // Removed fetchComments from dependencies

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    createComment,
    likeComment,
    refetch: fetchComments
  };
};
