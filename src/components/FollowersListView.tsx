import { useState, useEffect } from 'react';
import { useFollows } from '@/hooks/useFollows';
import FollowButton from '@/components/FollowButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FollowersListViewProps {
  userId: string;
}

interface FollowUser {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

const FollowersListView = ({ userId }: FollowersListViewProps) => {
  const { getFollowers } = useFollows();
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchFollowers();
    }
  }, [userId]);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const data = await getFollowers(userId);
      
      const formattedUsers = data.map((item: any) => {
        const user = item.follower;
        return {
          id: user.id,
          user_id: user.user_id,
          username: user.username || '',
          display_name: user.display_name || '',
          avatar_url: user.avatar_url || ''
        };
      });
      
      setFollowers(formattedUsers);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abonnés</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : followers.length > 0 ? (
          <div className="space-y-3">
            {followers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                    alt={user.display_name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.display_name}</p>
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
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun abonné pour le moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowersListView;