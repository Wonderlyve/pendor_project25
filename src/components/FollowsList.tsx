import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFollows } from '@/hooks/useFollows';
import FollowButton from '@/components/FollowButton';

interface FollowsListProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

interface FollowUser {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

const FollowsList = ({ isOpen, onClose, userId, type }: FollowsListProps) => {
  const { getFollowers, getFollowing } = useFollows();
  const navigate = useNavigate();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleProfileClick = (targetUserId: string) => {
    navigate(`/profile?userId=${targetUserId}`);
    onClose();
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = type === 'followers' 
        ? await getFollowers(userId)
        : await getFollowing(userId);
      
      const formattedUsers = data.map((item: any) => {
        const user = type === 'followers' ? item.follower : item.following;
        return {
          id: user.id,
          user_id: user.user_id,
          username: user.username || '',
          display_name: user.display_name || '',
          avatar_url: user.avatar_url || ''
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Abonnés' : 'Abonnements'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer hover:opacity-75 flex-1"
                    onClick={() => handleProfileClick(user.user_id)}
                  >
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                      alt={user.display_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.display_name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <FollowButton 
                    targetUserId={user.user_id} 
                    size="sm"
                    showText={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">
                {type === 'followers' ? 'Aucun abonné' : 'Aucun abonnement'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowsList;