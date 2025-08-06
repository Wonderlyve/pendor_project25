
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const NotificationIcon = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="relative text-white hover:bg-white/20"
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </Button>
  );
};

export default NotificationIcon;
