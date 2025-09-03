import { useEffect } from 'react';

export const usePWANotifications = () => {

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        // Demander explicitement toutes les permissions nécessaires
        const permission = await Notification.requestPermission();
        
        // Vérifier les permissions du service worker
        if ('serviceWorker' in navigator && 'pushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            console.log('Push subscription status:', subscription ? 'Active' : 'Inactive');
          } catch (error) {
            console.log('Push manager not available:', error);
          }
        }
        
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  };

  const setupPWANotifications = async () => {
    // Register service worker first
    await registerServiceWorker();
    
    // Request notification permissions
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
      console.log('PWA notifications ready');
      
      // Enable audio context on user interaction for iOS Safari
      const enableAudioContext = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        // Remove listener after first interaction
        document.removeEventListener('touchstart', enableAudioContext);
        document.removeEventListener('click', enableAudioContext);
      };
      
      document.addEventListener('touchstart', enableAudioContext);
      document.addEventListener('click', enableAudioContext);
    }
  };

  const playPWANotificationSound = async () => {
    try {
      // Create multiple fallback methods for PWA sound
      
      // Method 1: Try HTML5 Audio with user gesture
      try {
        const audio = new Audio('/beep.wav');
        audio.volume = 0.6;
        await audio.play();
        return;
      } catch (audioError) {
        console.log('HTML5 Audio failed, trying Web Audio API');
      }

      // Method 2: Web Audio API with enhanced settings for PWA
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create multiple oscillators for richer sound
      const createBeep = (freq: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Create notification melody
      const currentTime = audioContext.currentTime;
      createBeep(800, currentTime, 0.15);
      createBeep(600, currentTime + 0.15, 0.15);
      createBeep(800, currentTime + 0.3, 0.2);
      
    } catch (error) {
      console.log('All audio methods failed:', error);
      
      // Method 3: Vibration as last resort (mobile PWA)
      if ('vibrator' in navigator || 'vibrate' in navigator) {
        (navigator as any).vibrate([200, 100, 200]);
      }
    }
  };

  useEffect(() => {
    setupPWANotifications();
  }, []);

  return {
    playPWANotificationSound,
    requestNotificationPermission
  };
};