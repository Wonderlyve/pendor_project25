import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        profilesRes,
        postsRes,
        likesRes,
        commentsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('post_likes').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);

      // Active today: posts created in last 24h (distinct user_ids)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('user_id')
        .gte('created_at', oneDayAgo);

      const activeTodaySet = new Set(recentPosts?.map(p => p.user_id) || []);

      return {
        totalUsers: profilesRes.count || 0,
        onlineUsers: activeTodaySet.size, // approximation
        activeToday: activeTodaySet.size,
        totalPosts: postsRes.count || 0,
        totalLikes: likesRes.count || 0,
        totalComments: commentsRes.count || 0,
        totalShares: 0,
      };
    },
    refetchInterval: 30000,
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['dashboard-recent-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, created_at, avatar_url')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!data || data.length === 0) return [];

      const userIds = data.map(u => u.user_id);

      // Fetch post counts per user
      const { data: postCounts } = await supabase
        .from('posts')
        .select('user_id')
        .in('user_id', userIds);

      const postCountMap = new Map<string, number>();
      postCounts?.forEach(p => {
        postCountMap.set(p.user_id, (postCountMap.get(p.user_id) || 0) + 1);
      });

      // Fetch follower counts per user
      const { data: followerCounts } = await supabase
        .from('follows')
        .select('following_id')
        .in('following_id', userIds);

      const followerCountMap = new Map<string, number>();
      followerCounts?.forEach(f => {
        followerCountMap.set(f.following_id, (followerCountMap.get(f.following_id) || 0) + 1);
      });

      return data.map(u => ({
        ...u,
        postCount: postCountMap.get(u.user_id) || 0,
        followerCount: followerCountMap.get(u.user_id) || 0,
      }));
    },
  });

  const { data: topPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['dashboard-top-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, user_id, content, likes, comments, created_at, custom_username')
        .order('likes', { ascending: false })
        .limit(10);

      if (!data || data.length === 0) return [];

      // Fetch profiles for post authors
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(post => {
        const profile = profileMap.get(post.user_id);
        return {
          id: post.id,
          author: post.custom_username || profile?.display_name || profile?.username || 'Anonyme',
          content: post.content,
          likes: post.likes || 0,
          comments: post.comments || 0,
        };
      });
    },
  });

  return {
    stats: stats || { totalUsers: 0, onlineUsers: 0, activeToday: 0, totalPosts: 0, totalLikes: 0, totalComments: 0, totalShares: 0 },
    recentUsers: recentUsers || [],
    topPosts: topPosts || [],
    isLoading: statsLoading || usersLoading || postsLoading,
  };
};
