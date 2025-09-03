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
        
        // Create notification with enhanced options for PWA
        const notification = new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          requireInteraction: false,
          silent: false, // Allow sound
          tag: 'pendor-notification', // Group notifications
          renotify: true,
          data: data
        } as NotificationOptions);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (data?.postId) {
            // Navigate to post if available
            window.location.href = `/?post=${data.postId}`;
          }
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker for better PWA support
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: { title, body, data }
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
            attachments: [{ id: 'icon', url: 'public/icon-192.png' }],
            actionTypeId: "",
            extra: data
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