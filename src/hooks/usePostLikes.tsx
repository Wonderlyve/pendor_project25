import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function usePostLikes(postId?: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLikeStatus = async () => {
    if (!postId) return;

    try {
      // Fetch post likes count
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      setLikesCount(post?.likes || 0);

      // Check if current user has liked this post
      if (user) {
        const { data: userLike, error: likeError } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        if (likeError && likeError.code !== 'PGRST116') {
          throw likeError;
        }

        setIsLiked(!!userLike);
      }
    } catch (error: any) {
      console.error('Error fetching like status:', error);
    }
  };

  const toggleLike = async () => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Erreur lors du like du post');
      // Revert optimistic update
      await fetchLikeStatus();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchLikeStatus();
    }
  }, [postId, user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post-likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchLikeStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return {
    isLiked,
    likesCount,
    loading,
    toggleLike
  };
}