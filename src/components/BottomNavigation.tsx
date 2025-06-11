
import { Home, Video, User, Plus, Crown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import CreatePredictionModal from './CreatePredictionModal';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const { user, requireAuth } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const handleCreateClick = () => {
    if (requireAuth()) {
      setShowCreateModal(true);
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
    { icon: Crown, label: 'Canaux', active: false, action: () => navigate('/channels') },
    { icon: Plus, label: '', active: false, action: handleCreateClick, isCenter: true },
    { icon: Video, label: 'Lives', active: false, action: () => navigate('/lives') },
    { icon: User, label: user ? 'Profil' : 'Connexion', active: false, action: handleProfileClick },
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
                className={`flex-1 py-2 px-1 flex flex-col items-center justify-center space-y-1 transition-colors ${
                  item.active
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {user && (
        <CreatePredictionModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal} 
        />
      )}
    </>
  );
};

export default BottomNavigation;
