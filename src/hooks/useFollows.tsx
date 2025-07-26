import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useFollows = (targetUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if current user is following the target user
  const checkIsFollowing = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    try {
      const { data } = await supabase.rpc('is_following', {
        follower_id: user.id,
        following_id: targetUserId
      });
      setIsFollowing(data || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  // Get follower count for a user
  const getFollowersCount = async (userId: string) => {
    try {
      const { data } = await supabase.rpc('get_follower_count', {
        user_id: userId
      });
      return data || 0;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  };

  // Get following count for a user
  const getFollowingCount = async (userId: string) => {
    try {
      const { data } = await supabase.rpc('get_following_count', {
        user_id: userId
      });
      return data || 0;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  };

  // Fetch counts for the target user
  const fetchCounts = async () => {
    if (!targetUserId) return;

    const [followers, following] = await Promise.all([
      getFollowersCount(targetUserId),
      getFollowingCount(targetUserId)
    ]);

    setFollowersCount(followers);
    setFollowingCount(following);
  };

  // Follow a user
  const followUser = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (error) {
        console.error('Error following user:', error);
        toast.error('Erreur lors du suivi');
      } else {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Utilisateur suivi');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du suivi');
    } finally {
      setLoading(false);
    }
  };

  // Unfollow a user
  const unfollowUser = async () => {
    if (!user || !targetUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) {
        console.error('Error unfollowing user:', error);
        toast.error('Erreur lors du désabonnement');
      } else {
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success('Désabonné avec succès');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du désabonnement');
    } finally {
      setLoading(false);
    }
  };

  // Get followers list
  const getFollowers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          created_at,
          follower:profiles!follows_follower_id_fkey(
            id,
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('following_id', userId);

      if (error) {
        console.error('Error getting followers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  // Get following list
  const getFollowing = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          created_at,
          following:profiles!follows_following_id_fkey(
            id,
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId);

      if (error) {
        console.error('Error getting following:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  useEffect(() => {
    if (targetUserId) {
      checkIsFollowing();
      fetchCounts();
    }
  }, [user, targetUserId]);

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkIsFollowing,
    fetchCounts
  };
};