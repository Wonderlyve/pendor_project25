
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useNotificationSettings = () => {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    // Récupérer les paramètres sauvegardés
    const savedPushNotifs = localStorage.getItem('pushNotifications');
    const savedEmailNotifs = localStorage.getItem('emailNotifications');
    
    if (savedPushNotifs !== null) {
      setPushNotifications(JSON.parse(savedPushNotifs));
    }
    if (savedEmailNotifs !== null) {
      setEmailNotifications(JSON.parse(savedEmailNotifs));
    }

    // Vérifier les permissions existantes pour les notifications push
    if ('Notification' in window) {
      setPushNotifications(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Les notifications sont bloquées. Veuillez les activer dans les paramètres du navigateur.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications push activées !');
        return true;
      } else {
        toast.error('Permission refusée pour les notifications');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      toast.error('Erreur lors de l\'activation des notifications');
      return false;
    }
  };

  const togglePushNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPushNotifications(true);
        localStorage.setItem('pushNotifications', 'true');
        toast.success('Notifications push activées');
      } else {
        setPushNotifications(false);
        localStorage.setItem('pushNotifications', 'false');
      }
    } else {
      setPushNotifications(false);
      localStorage.setItem('pushNotifications', 'false');
      toast.success('Notifications push désactivées');
    }
  };

  const toggleEmailNotifications = (enabled: boolean) => {
    setEmailNotifications(enabled);
    localStorage.setItem('emailNotifications', JSON.stringify(enabled));
    toast.success(enabled ? 'Notifications email activées' : 'Notifications email désactivées');
  };

  return {
    pushNotifications,
    emailNotifications,
    togglePushNotifications,
    toggleEmailNotifications
  };
};
