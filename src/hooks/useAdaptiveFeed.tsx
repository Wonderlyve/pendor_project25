import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Post } from '@/hooks/useOptimizedPosts';

interface UserHistory {
  likedSports: Map<string, number>;
  likedAuthors: Map<string, number>;
  viewedPosts: Set<string>;
}

/**
 * Adaptive feed algorithm that ranks posts based on user interaction history.
 * Scores each post considering:
 * - Sport preference (based on likes history)
 * - Author affinity (based on followed/liked authors)
 * - Freshness (recent posts score higher)
 * - Engagement (likes/comments ratio)
 * - Unseen bonus (posts the user hasn't viewed yet)
 */
export const useAdaptiveFeed = (posts: Post[]) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserHistory>({
    likedSports: new Map(),
    likedAuthors: new Map(),
    viewedPosts: new Set(),
  });
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load user interaction history
  useEffect(() => {
    if (!user) {
      setHistoryLoaded(true);
      return;
    }

    const loadHistory = async () => {
      try {
        const [likesRes, viewsRes, followsRes] = await Promise.all([
          supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(200),
          supabase
            .from('post_views')
            .select('post_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(500),
          supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id),
        ]);

        const likedPostIds = likesRes.data?.map((l) => l.post_id) || [];
        const viewedPostIds = new Set(viewsRes.data?.map((v) => v.post_id) || []);
        const followedIds = new Set(followsRes.data?.map((f) => f.following_id) || []);

        // If user has liked posts, fetch those posts' details to build preference profile
        const likedSports = new Map<string, number>();
        const likedAuthors = new Map<string, number>();

        if (likedPostIds.length > 0) {
          const { data: likedPosts } = await supabase
            .from('posts')
            .select('sport, user_id')
            .in('id', likedPostIds.slice(0, 100));

          likedPosts?.forEach((p) => {
            if (p.sport) {
              likedSports.set(p.sport, (likedSports.get(p.sport) || 0) + 1);
            }
            likedAuthors.set(p.user_id, (likedAuthors.get(p.user_id) || 0) + 1);
          });
        }

        // Boost followed authors
        followedIds.forEach((id) => {
          likedAuthors.set(id, (likedAuthors.get(id) || 0) + 3);
        });

        setHistory({ likedSports, likedAuthors, viewedPosts: viewedPostIds });
      } catch (err) {
        console.error('Error loading user history for adaptive feed:', err);
      } finally {
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [user]);

  const scorePost = useCallback(
    (post: Post): number => {
      let score = 0;

      // 1. Sport preference (0-30 pts)
      if (post.sport && history.likedSports.has(post.sport)) {
        const sportAffinity = Math.min(history.likedSports.get(post.sport)! / 5, 1);
        score += sportAffinity * 30;
      }

      // 2. Author affinity (0-25 pts)
      if (history.likedAuthors.has(post.user_id)) {
        const authorAffinity = Math.min(history.likedAuthors.get(post.user_id)! / 5, 1);
        score += authorAffinity * 25;
      }

      // 3. Freshness (0-20 pts) — exponential decay over 48h
      const ageMs = Date.now() - new Date(post.created_at).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      const freshness = Math.exp(-ageHours / 24);
      score += freshness * 20;

      // 4. Engagement quality (0-15 pts)
      const totalEngagement = (post.likes || 0) + (post.views || 0) * 0.1;
      const engagementScore = Math.min(totalEngagement / 20, 1);
      score += engagementScore * 15;

      // 5. Unseen bonus (0-10 pts)
      if (!history.viewedPosts.has(post.id)) {
        score += 10;
      }

      return score;
    },
    [history]
  );

  const adaptedPosts = useMemo(() => {
    if (!historyLoaded || !user) return posts;

    // No history yet → return chronological
    if (history.likedSports.size === 0 && history.likedAuthors.size === 0) {
      return posts;
    }

    const scored = posts.map((post) => ({
      post,
      score: scorePost(post),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.post);
  }, [posts, historyLoaded, user, history, scorePost]);

  return {
    adaptedPosts,
    historyLoaded,
  };
};
