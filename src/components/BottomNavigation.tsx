
import { Home, Video, User, Plus, Crown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChannelNotifications } from '@/hooks/useChannelNotifications';
import CreatePredictionModal from './CreatePredictionModal';
import DebriefingModal from './channel-chat/DebriefingModal';
import LoadingModal from './LoadingModal';
import SuccessModal from './SuccessModal';
import { useDebriefings } from '@/hooks/useDebriefings';
import { CreateStoryModal } from './CreateStoryModal';
import { toast } from 'sonner';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, requireAuth } = useAuth();
  const { unreadChannelCount } = useChannelNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { createPublicBrief } = useDebriefings(null);
  
  const handleCreateClick = () => {
    if (requireAuth()) {
      // Créer un canal si on est sur la page channels, un post si on est sur l'accueil, une story si on est sur /story, sinon un brief
      if (location.pathname === '/channels') {
        // Trigger channel creation - we'll emit a custom event
        window.dispatchEvent(new CustomEvent('createChannel'));
      } else if (location.pathname === '/') {
        setShowCreateModal(true);
      } else if (location.pathname === '/story') {
        setShowStoryModal(true);
      } else {
        setShowBriefModal(true);
      }
    }
  };

  const handleCreateBrief = async (briefData: any) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un brief');
      return;
    }

    try {
      setShowBriefModal(false);
      setShowLoadingModal(true);
      
      const success = await createPublicBrief(briefData);
      
      setShowLoadingModal(false);
      
      if (success) {
        setShowSuccessModal(true);
        // Rediriger vers la page Brief si on n'y est pas déjà
        if (location.pathname !== '/brief') {
          setTimeout(() => {
            navigate('/brief');
          }, 1500); // Délai pour voir le message de succès
        }
      } else {
        toast.error('Erreur lors de la publication du brief');
      }
    } catch (error: any) {
      setShowLoadingModal(false);
      console.error('Erreur lors de la création du brief:', error);
      toast.error(error?.message || 'Erreur lors de la publication du brief');
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };
  
  const navItems = [
    { icon: Home, label: 'Accueil', active: true, action: () => navigate('/') },
    { icon: User, label: 'Brief', active: false, action: () => navigate('/story') },
    { icon: Plus, label: '', active: false, action: handleCreateClick, isCenter: true },
    { icon: Crown, label: 'Canaux', active: false, action: () => navigate('/channels'), hasNotification: unreadChannelCount > 0, notificationCount: unreadChannelCount },
    { icon: Video, label: 'Briefing', active: false, action: () => navigate('/brief') },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            if (item.isCenter) {
              return (
                <div key={index} className="flex-1 flex justify-center">
                  <button
                    onClick={item.action}
                    className={`w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center -mt-6 shadow-lg border-4 border-white transition-transform hover:scale-105 ${
                      !user ? 'opacity-50' : ''
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </button>
                </div>
              );
            }
            return (
              <button
                key={index}
                onClick={item.action}
                className={`flex-1 py-2 px-1 flex flex-col items-center justify-center space-y-1 transition-colors relative ${
                  item.active
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.hasNotification && (
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-4 flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-1">
                        {item.notificationCount > 99 ? '99+' : item.notificationCount}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {user && (
        <>
          <CreatePredictionModal 
            open={showCreateModal} 
            onOpenChange={setShowCreateModal} 
          />
          <CreateStoryModal
            open={showStoryModal}
            onOpenChange={setShowStoryModal}
          />
          <DebriefingModal
            isOpen={showBriefModal}
            onClose={() => setShowBriefModal(false)}
            onSubmit={handleCreateBrief}
          />
          <LoadingModal
            isOpen={showLoadingModal}
            title="Publication en cours..."
            description="Votre brief est en cours de publication, veuillez patienter."
          />
          <SuccessModal
            isOpen={showSuccessModal}
            title="Brief publié !"
            description="Votre brief a été publié avec succès et est maintenant visible par tous."
            onClose={() => setShowSuccessModal(false)}
          />
        </>
      )}
    </>
  );
};

export default BottomNavigation;
