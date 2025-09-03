import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const useNativeNotifications = () => {
  
  const initializeNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not running on native platform, skipping native notifications setup');
      return;
    }

    try {
      // Créer un canal de notification pour Android
      if (Capacitor.getPlatform() === 'android') {
        try {
          await LocalNotifications.createChannel({
            id: 'pendor-channel',
            name: 'Notifications Pendor',
            description: 'Canal pour les notifications de l\'application Pendor',
            sound: 'beep.wav',
            importance: 5, // Importance maximale
            visibility: 1, // Visible sur l'écran de verrouillage
            lights: true,
            lightColor: '#3B82F6',
            vibration: true
          });
        } catch (channelError) {
          console.log('Channel creation error (might already exist):', channelError);
        }
      }

      // Request permissions for local notifications
      const localPermission = await LocalNotifications.requestPermissions();
      console.log('Local notifications permission:', localPermission);

      // Request permissions for push notifications
      const pushPermission = await PushNotifications.requestPermissions();
      console.log('Push notifications permission:', pushPermission);

      if (pushPermission.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
      }

      // Listen for registration events
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Handle push notifications received while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        
        // Show as local notification with sound
        LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title || 'Nouveau pronostic',
              body: notification.body || 'Vous avez reçu une nouvelle notification',
              id: Date.now(),
              sound: 'beep.wav',
              attachments: notification.data?.icon ? [{ id: 'icon', url: notification.data.icon }] : undefined,
              actionTypeId: "",
              extra: notification.data
            }
          ]
        });
      });

      // Handle action performed on a push notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });

      // Handle local notification actions
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Local notification action performed:', notification);
      });

    } catch (error) {
      console.error('Error initializing native notifications:', error);
    }
  };

  const showLocalNotification = async (title: string, body: string, data?: any) => {
    if (!Capacitor.isNativePlatform()) {
      // Enhanced PWA notification support
      if ('Notification' in window && Notification.permission === 'granted') {
        // Play sound first
        await playNotificationSound();
        
        // Create notification with enhanced options for PWA and lock screen
        const notification = new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          image: data?.image || null,
          requireInteraction: true, // Important pour l'écran de verrouillage
          silent: false,
          vibrate: [200, 100, 200, 100, 200],
          tag: 'pendor-notification-' + Date.now(),
          renotify: true,
          sticky: true, // Garde la notification visible
          persistent: true,
          timestamp: Date.now(),
          dir: 'auto',
          lang: 'fr',
          actions: [
            { action: 'view', title: 'Voir' },
            { action: 'settings', title: 'Paramètres' },
            { action: 'dismiss', title: 'Ignorer' }
          ],
          data: {
            url: data?.url || '/',
            timestamp: Date.now(),
            notificationId: Date.now(),
            ...data
          }
        } as NotificationOptions);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (data?.postId) {
            window.location.href = `/?post=${data.postId}`;
          } else if (data?.url) {
            window.location.href = data.url;
          }
        };

        // Ne pas fermer automatiquement pour l'écran de verrouillage
        return;
      } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker for better PWA support
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: { 
            title, 
            body, 
            data: {
              ...data,
              url: data?.url || '/',
              timestamp: Date.now(),
              notificationId: Date.now()
            }
          }
        });
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            sound: 'beep.wav',
            smallIcon: 'res://drawable/ic_stat_icon_config_sample',
            iconColor: '#3B82F6',
            largeIcon: '/icon-192.png',
            attachments: data?.image ? [
              { id: 'icon', url: '/icon-192.png' },
              { id: 'image', url: data.image }
            ] : [{ id: 'icon', url: '/icon-192.png' }],
            actionTypeId: "OPEN_ACTION",
            extra: {
              ...data,
              timestamp: Date.now(),
              notificationId: Date.now()
            },
            schedule: undefined, // Notification immédiate
            summaryText: 'Pendor',
            group: 'pendor-notifications',
            groupSummary: false,
            channelId: 'pendor-channel',
            ongoing: false,
            autoCancel: true,
            inboxList: data?.messages ? data.messages : undefined
          }
        ]
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  };

  const playNotificationSound = async () => {
    if (Capacitor.isNativePlatform()) {
      // On native platforms, sound is handled by the notification itself
      return;
    }

    // Enhanced web audio for PWA
    try {
      // Try to play audio file first (better for PWA)
      const audio = new Audio('/beep.wav');
      audio.volume = 0.5;
      
      // Handle autoplay restrictions
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to Web Audio API if audio file fails
          console.log('Audio file failed, using Web Audio API fallback');
          generateNotificationTone();
        });
      }
    } catch (error) {
      // Fallback to Web Audio API
      console.log('Audio file not supported, using Web Audio API');
      generateNotificationTone();
    }
  };

  const generateNotificationTone = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (required for some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error('Error generating notification tone:', error);
    }
  };

  useEffect(() => {
    initializeNotifications();

    return () => {
      // Cleanup listeners when component unmounts
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
        LocalNotifications.removeAllListeners();
      }
    };
  }, []);

  return {
    showLocalNotification,
    playNotificationSound
  };
};