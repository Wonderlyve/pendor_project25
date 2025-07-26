import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useCommentLikes(commentId?: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLikeStatus = useCallback(async () => {
    if (!commentId) return;

    try {
      // Fetch both comment likes count and user like status in parallel
      const [commentResponse, userLikeResponse] = await Promise.all([
        supabase
          .from('comments')
          .select('likes')
          .eq('id', commentId)
          .single(),
        user ? supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      if (commentResponse.error) throw commentResponse.error;
      
      setLikesCount(commentResponse.data?.likes || 0);
      setIsLiked(!!userLikeResponse.data);
    } catch (error: any) {
      console.error('Error fetching comment like status:', error);
    }
  }, [commentId, user]);

  const toggleLike = useCallback(async () => {
    if (!user || !commentId) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    if (loading) return;

    // Optimistic update
    const wasLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    setLoading(true);

    try {
      if (wasLiked) {
        // Unlike the comment
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like the comment
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      toast.error('Erreur lors du like du commentaire');
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikesCount(previousCount);
    } finally {
      setLoading(false);
    }
  }, [user, commentId, loading, isLiked, likesCount]);

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!commentId) return;

    const channel = supabase
      .channel(`comment-likes-${commentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
          filter: `comment_id=eq.${commentId}`
        },
        () => {
          // Only fetch if we're not currently toggling a like
          if (!loading) {
            fetchLikeStatus();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `id=eq.${commentId}`
        },
        (payload) => {
          // Update likes count from comments table update
          if (payload.new && payload.new.likes !== undefined) {
            setLikesCount(payload.new.likes);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentId, loading, fetchLikeStatus]);

  return {
    isLiked,
    likesCount,
    loading,
    toggleLike
  };
}