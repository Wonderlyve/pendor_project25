import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePostComments(postId?: string) {
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCommentsCount = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      
      setCommentsCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching comments count:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchCommentsCount();
  }, [fetchCommentsCount]);

  // Subscribe to real-time inserts/deletes on comments table for this post
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post-comments-count-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          setCommentsCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          setCommentsCount(prev => Math.max(0, prev - 1));
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