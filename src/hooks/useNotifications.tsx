
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePWABadge } from '@/hooks/usePWABadge';

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

  // Utiliser le hook PWA Badge pour mettre à jour l'icône de l'app
  usePWABadge(unreadCount);

  const playNotificationSound = () => {
    // Créer un son de notification
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showBrowserNotification = (notification: Notification) => {
    // Vérifier les paramètres des notifications push
    const pushNotificationsEnabled = localStorage.getItem('pushNotifications');
    
    if (pushNotificationsEnabled === 'true' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Nouveau pronostic', {
        body: notification.content,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      });
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
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Jouer le son de notification
          playNotificationSound();
          
          // Afficher la notification du navigateur
          showBrowserNotification(newNotification);
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
