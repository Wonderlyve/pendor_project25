import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  likes: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
  replies?: Comment[];
}

export function useComments(postId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchComments = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      
      // Fetch comments with profiles 
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!commentsData) {
        setComments([]);
        return;
      }

      // Check which comments the current user has liked
      let userLikes: { comment_id: string }[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsData.map(c => c.id));
        
        userLikes = likesData || [];
      }

      const likedCommentIds = new Set(userLikes.map(like => like.comment_id));

      // Get profiles for all comments
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Transform comments and build tree structure
      const commentsWithLikes = commentsData.map(comment => ({
        ...comment,
        is_liked: likedCommentIds.has(comment.id),
        profiles: profilesMap.get(comment.user_id) || null,
        replies: []
      }));

      // Build tree structure for replies
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      commentsWithLikes.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      commentsWithLikes.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté pour commenter');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        })
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Commentaire ajouté avec succès');
      // Don't refresh all comments, let real-time handle it
      return data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Don't refresh all comments, just let real-time handle it
    } catch (error: any) {
      console.error('Error liking comment:', error);
      toast.error('Erreur lors du like du commentaire');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Commentaire supprimé');
      // Don't refresh all comments, let real-time handle it
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error('Erreur lors de la suppression du commentaire');
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, user]);

  // Subscribe to real-time comment updates
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments-${postId}`)
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes'
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return {
    comments,
    loading,
    addComment,
    likeComment,
    deleteComment,
    fetchComments
  };
}