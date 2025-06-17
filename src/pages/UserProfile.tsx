
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserPlus, UserMinus, Trophy, TrendingUp, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PredictionCard } from '@/components/PredictionCard';

interface UserData {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  created_at: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  wins?: number;
  losses?: number;
  win_rate?: number;
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  type: 'simple' | 'combined';
  matches?: any[];
  total_odds?: number;
  stake?: number;
  potential_gain?: number;
  sport?: string;
  status?: 'pending' | 'won' | 'lost';
  reservation_code?: string;
}

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) {
      fetchUserData();
      fetchUserPosts();
      if (currentUser) {
        checkFollowStatus();
      }
    }
  }, [username, currentUser]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Erreur lors du chargement du profil');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('profiles.username', username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || !userData) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', userData.id)
        .single();

      if (!error && data) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !userData) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userData.id);

        if (error) throw error;
        setIsFollowing(false);
        toast.success('Vous ne suivez plus cet utilisateur');
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert([
            { follower_id: currentUser.id, following_id: userData.id }
          ]);

        if (error) throw error;
        setIsFollowing(true);
        toast.success('Vous suivez maintenant cet utilisateur');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Erreur lors de l\'action');
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Utilisateur introuvable</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">L'utilisateur que vous recherchez n'existe pas.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Profil
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userData.avatar_url} alt={userData.full_name} />
                <AvatarFallback className="text-2xl">
                  {userData.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {userData.full_name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">@{userData.username}</p>
                  </div>
                  
                  {currentUser && currentUser.id !== userData.id && (
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      variant={isFollowing ? "outline" : "default"}
                      className="ml-4"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Ne plus suivre
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Suivre
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {userData.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{userData.bio}</p>
                )}

                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Rejoint en {formatDate(userData.created_at)}</span>
                  </div>
                  {userData.location && (
                    <span>{userData.location}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {userData.posts_count || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {userData.followers_count || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Abonnés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {userData.following_count || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Suivi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {userData.win_rate ? `${userData.win_rate}%` : '0%'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Réussite</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Pronostics</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PredictionCard
                  key={post.id}
                  id={post.id}
                  user={{
                    name: userData.full_name,
                    username: userData.username,
                    avatar: userData.avatar_url,
                    isVerified: false
                  }}
                  type={post.type}
                  sport={post.sport}
                  matches={post.matches || []}
                  totalOdds={post.total_odds}
                  stake={post.stake}
                  potentialGain={post.potential_gain}
                  description={post.content}
                  image={post.image_url}
                  video={post.video_url}
                  likes={post.likes_count}
                  comments={post.comments_count}
                  shares={post.shares_count}
                  isLiked={false}
                  isBookmarked={false}
                  timestamp={new Date(post.created_at).toLocaleDateString('fr-FR')}
                  status={post.status}
                  reservationCode={post.reservation_code}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Aucun pronostic
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cet utilisateur n'a pas encore publié de pronostics.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold">Pronostics gagnants</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {userData.wins || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-red-500" />
                    <div>
                      <h3 className="font-semibold">Pronostics perdants</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {userData.losses || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
