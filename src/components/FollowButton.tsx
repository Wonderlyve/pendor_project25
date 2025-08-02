import { Button } from '@/components/ui/button';
import { useFollows } from '@/hooks/useFollows';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

const FollowButton = ({ 
  targetUserId, 
  variant = 'outline', 
  size = 'sm',
  showText = true
}: FollowButtonProps) => {
  const { user } = useAuth();
  const { isFollowing, loading, followUser, unfollowUser } = useFollows(targetUserId);

  // Don't show button for own profile
  if (!user || user.id === targetUserId) {
    return null;
  }

  const handleClick = () => {
    if (isFollowing) {
      unfollowUser();
    } else {
      followUser();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
    >
      {showText ? (
        <>
          {isFollowing ? (
            <>
              <UserMinus className="w-4 h-4 mr-1" />
              Suivi
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              Suivre
            </>
          )}
        </>
      ) : (
        isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
      )}
    </Button>
  );
};

export default FollowButton;