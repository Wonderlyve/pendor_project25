import { useState } from 'react';
import { ArrowLeft, Users, Crown, MoreVertical, Plus, Info, Heart, UserMinus, Share, Bell, BellOff, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ChannelInfo {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  creator_username?: string;
  creator_badge?: string;
  subscriber_count?: number;
}

interface ChatHeaderProps {
  channelName: string;
  channelInfo: ChannelInfo | null;
  onBack: () => void;
  onCreateVipProno?: () => void;
  onCreateDebriefing?: () => void;
  onDeleteChannel?: () => void;
  className?: string;
}

const ChatHeader = ({ channelName, channelInfo, onBack, onCreateVipProno, onCreateDebriefing, onDeleteChannel, className }: ChatHeaderProps) => {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleCreateVipProno = () => {
    if (onCreateVipProno) {
      onCreateVipProno();
    }
  };

  const handleCreateDebriefing = () => {
    if (onCreateDebriefing) {
      onCreateDebriefing();
    }
  };

  const handleChannelInfo = () => {
    toast.info('Informations du canal - Fonctionnalité en développement');
  };

  const handleAddToFavorites = () => {
    toast.success('Canal ajouté aux favoris !');
  };

  const handleUnsubscribe = () => {
    toast.success('Désabonnement effectué !');
  };

  const handleInvite = () => {
    toast.info('Invitation - Fonctionnalité en développement');
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Notifications ${!notificationsEnabled ? 'activées' : 'désactivées'} !`);
  };

  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-3 ${className || 'sticky top-0 z-10'}`}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{channelName}</h1>
            {channelInfo && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-3 h-3" />
                <span>{channelInfo.subscriber_count} abonnés</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channelInfo.creator_id}`}
                    alt="Creator"
                    className="w-4 h-4 rounded-full"
                  />
                  <span>{channelInfo.creator_username}</span>
                  {channelInfo.creator_badge && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {channelInfo.creator_badge}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {channelInfo && user?.id === channelInfo.creator_id && (
              <>
                <DropdownMenuItem onClick={handleCreateVipProno}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer prono VIP
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateDebriefing}>
                  <FileText className="w-4 h-4 mr-2" />
                  Créer un débriefing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleChannelInfo}>
              <Info className="w-4 h-4 mr-2" />
              Info du canal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToFavorites}>
              <Heart className="w-4 h-4 mr-2" />
              Ajouter aux favoris
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUnsubscribe}>
              <UserMinus className="w-4 h-4 mr-2" />
              Se désabonner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleInvite}>
              <Share className="w-4 h-4 mr-2" />
              Inviter
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleNotifications}>
              {notificationsEnabled ? (
                <BellOff className="w-4 h-4 mr-2" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              {notificationsEnabled ? 'Désactiver notifications' : 'Activer notifications'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;