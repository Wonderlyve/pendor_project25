
import { useState, useEffect, useCallback, useRef } from 'react';
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
  likes_count: number;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  badge?: string;
  replies?: Comment[];
  is_liked?: boolean;
}

export const useCommentsFixed = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  const fetchComments = useCallback(async () => {
    if (!postId || postId === 'undefined' || postId === 'NaN') {
      console.error('Invalid post ID for comments:', postId);
      return;
    }
    
    setLoading(true);
    try {
      // Récupérer les commentaires avec une jointure correcte
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
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

      // Récupérer les likes de l'utilisateur actuel
      let userLikes: string[] = [];
      if (user && commentsData?.length > 0) {
        const commentIds = commentsData.map(comment => comment.id);
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);
        
        userLikes = likesData?.map(like => like.comment_id) || [];
      }

      // Transformer les données des commentaires
      const transformedComments = commentsData?.map((comment: any) => ({
        ...comment,
        username: comment.profiles?.username,
        display_name: comment.profiles?.display_name,
        avatar_url: comment.profiles?.avatar_url,
        badge: comment.profiles?.badge,
        is_liked: userLikes.includes(comment.id),
      })) || [];

      // Organiser les commentaires avec leurs réponses
      const rootComments = transformedComments.filter((comment: Comment) => !comment.parent_id);
      const commentsWithReplies = rootComments.map((comment: Comment) => ({
        ...comment,
        replies: transformedComments.filter((reply: Comment) => reply.parent_id === comment.id)
      }));

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error in fetchComments:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  const createComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour commenter');
      return null;
    }

    if (!content.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return null;
    }

    if (!postId || postId === 'undefined' || postId === 'NaN') {
      console.error('Invalid post ID for comment creation:', postId);
      toast.error('ID de post invalide');
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
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        toast.error('Erreur lors de la création du commentaire');
        return null;
      }

      toast.success('Commentaire ajouté avec succès');
      await fetchComments();
      return data;
    } catch (error) {
      console.error('Error in createComment:', error);
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
      const { data: existingLike, error: checkError } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking comment like status:', checkError);
        return;
      }

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

      await fetchComments();
    } catch (error) {
      console.error('Error in likeComment:', error);
    }
  };

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
