
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
  const channelRef = useRef<any>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      // Fetch comments with profile data using a proper join
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      // Fetch profile data separately for each unique user_id
      const userIds = [...new Set(commentsData?.map(comment => comment.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, badge')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Map profile data to comments
      const transformedComments = commentsData?.map((comment: any) => {
        const profile = profilesData?.find(p => p.id === comment.user_id);
        return {
          ...comment,
          username: profile?.username,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          badge: profile?.badge,
        };
      }) || [];

      // Organiser les commentaires avec leurs réponses
      const rootComments = transformedComments.filter((comment: Comment) => !comment.parent_id);
      const commentsWithReplies = rootComments.map((comment: Comment) => ({
        ...comment,
        replies: transformedComments.filter((reply: Comment) => reply.parent_id === comment.id)
      }));

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error:', error);
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

      toast.success('Commentaire ajouté avec succès');
      // Refresh comments after successful creation
      await fetchComments();
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

      await fetchComments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Charger les commentaires au montage
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Gestion des mises à jour en temps réel
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [postId, fetchComments]);

  return {
    comments,
    loading,
    createComment,
    likeComment,
    refetch: fetchComments
  };
};
