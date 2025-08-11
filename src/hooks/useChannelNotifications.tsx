import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChannelNotification {
  id: string;
  channel_id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
  from_user_id?: string;
}

export const useChannelNotifications = () => {
  const [channelNotifications, setChannelNotifications] = useState<ChannelNotification[]>([]);
  const [unreadChannelCount, setUnreadChannelCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchChannelNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'channel_message')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChannelNotifications(data || []);
      setUnreadChannelCount((data || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching channel notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCountForChannel = (channelId: string) => {
    return channelNotifications.filter(n => 
      n.channel_id === channelId && !n.read
    ).length;
  };

  const markChannelNotificationsAsRead = async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setChannelNotifications(prev => 
        prev.map(n => 
          n.channel_id === channelId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadChannelCount(prev => 
        prev - channelNotifications.filter(n => 
          n.channel_id === channelId && !n.read
        ).length
      );
    } catch (error) {
      console.error('Error marking channel notifications as read:', error);
    }
  };

  const markAllChannelNotificationsAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('type', 'channel_message')
        .eq('read', false);

      if (error) throw error;

      setChannelNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadChannelCount(0);
    } catch (error) {
      console.error('Error marking all channel notifications as read:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchChannelNotifications();

    // Set up real-time subscription for new channel notifications
    const channel = supabase
      .channel('channel-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.type === 'channel_message') {
            const newNotification = payload.new as ChannelNotification;
            setChannelNotifications(prev => [newNotification, ...prev]);
            setUnreadChannelCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    channelNotifications,
    unreadChannelCount,
    loading,
    getUnreadCountForChannel,
    markChannelNotificationsAsRead,
    markAllChannelNotificationsAsRead,
    refetch: fetchChannelNotifications
  };
};