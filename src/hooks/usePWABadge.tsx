import { useEffect } from 'react';

export const usePWABadge = (unreadCount: number) => {
  useEffect(() => {
    console.log('PWA Badge: unreadCount =', unreadCount);
    console.log('PWA Badge: setAppBadge supported =', 'setAppBadge' in navigator);
    
    // Vérifier si l'API Badging est supportée
    if ('setAppBadge' in navigator) {
      try {
        if (unreadCount > 0) {
          // Afficher le badge avec le nombre de notifications
          console.log('Setting app badge to:', unreadCount);
          (navigator as any).setAppBadge(unreadCount);
        } else {
          // Effacer le badge
          console.log('Clearing app badge');
          (navigator as any).clearAppBadge();
        }
      } catch (error) {
        console.log('Error setting app badge:', error);
      }
    } else {
      console.log('PWA Badge API not supported on this browser/device');
    }
  }, [unreadCount]);
};