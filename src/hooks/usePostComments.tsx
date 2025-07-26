import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePostComments(postId?: string) {
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCommentsCount = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('comments')
        .eq('id', postId)
        .single();

      if (error) throw error;
      
      setCommentsCount(data?.comments || 0);
    } catch (error: any) {
      console.error('Error fetching comments count:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchCommentsCount();
  }, [fetchCommentsCount]);

  // Subscribe to real-time updates for post comments count
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        (payload) => {
          // Update comments count from posts table update
          if (payload.new && payload.new.comments !== undefined) {
            setCommentsCount(payload.new.comments);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return {
    commentsCount,
    loading
  };
}