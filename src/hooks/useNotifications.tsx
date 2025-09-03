
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePWABadge } from '@/hooks/usePWABadge';
import { useNativeNotifications } from '@/hooks/useNativeNotifications';
import { usePWANotifications } from '@/hooks/usePWANotifications';

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
  post_id?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const { showLocalNotification, playNotificationSound } = useNativeNotifications();
  const { playPWANotificationSound } = usePWANotifications();

  // Utiliser le hook PWA Badge pour mettre à jour l'icône de l'app
  usePWABadge(unreadCount);

  const showNotification = async (notification: Notification) => {
    // Vérifier les paramètres des notifications push
    const pushNotificationsEnabled = localStorage.getItem('pushNotifications');
    
    if (pushNotificationsEnabled === 'true') {
      await showLocalNotification(
        'Nouveau pronostic', 
        notification.content,
        { notificationId: notification.id, postId: notification.post_id }
      );
    }
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!user) return;

    // Nettoyer l'ancien canal s'il existe
    if (channelRef.current) {
      console.log('Cleaning up existing notifications channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Créer un nouveau canal avec un identifiant unique
    const sessionId = Math.random().toString(36).substring(2, 15);
    const channelName = `notifications-changes-${sessionId}`;
    
    console.log('Creating notifications channel:', channelName);

    try {
      const channel = supabase.channel(channelName);
      
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification:', payload);
          const newNotification = payload.new as Notification;
          
          // Enhanced notification handling for PWA and native
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Play sound - enhanced for PWA
          playNotificationSound();
          playPWANotificationSound();
          
          // Show notification
          showNotification(newNotification);
        }
      )
      .subscribe((status: string) => {
        console.log('Notifications subscription status:', status);
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up notifications channel:', error);
    }

    return () => {
      if (channelRef.current) {
        console.log('Unsubscribing from notifications channel');
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing notifications channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
