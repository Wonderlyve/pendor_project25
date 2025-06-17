
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, BarChart3, Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserPost {
  id: string;
  content: string;
  sport?: string;
  match_teams?: string;
  prediction_text?: string;
  odds: number;
  confidence: number;
  likes: number;
  comments: number;
  created_at: string;
  image_url?: string;
}

interface UserProfileData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  badge: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  success_rate: number;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserPosts();
      checkFollowStatus();
    }
  }, [username, user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Utilisateur introuvable');
        navigate('/');
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          username: data.username,
          display_name: data.display_name || data.username,
          avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
          bio: data.bio || '',
          badge: data.badge || 'Nouveau',
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0,
          posts_count: 0,
          success_rate: 75
        });
        setFollowersCount(data.followers_count || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user posts:', error);
      } else {
        setUserPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) {
      toast.error('Vous devez être connecté pour suivre cet utilisateur');
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) throw error;
        
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast.success('Vous ne suivez plus cet utilisateur');
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });

        if (error) throw error;
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Vous suivez maintenant cet utilisateur');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Erreur lors de l\'action');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Pro':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Confirmé':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expert':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
          <h1 className="text-2xl font-bold text-white">Profil</h1>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement du profil...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
          <h1 className="text-2xl font-bold text-white">Profil introuvable</h1>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-6 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white mx-auto"
            />
          </div>
          
          <div className="text-white">
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <p className="text-green-100">@{profile.username}</p>
            <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
              {profile.badge}
            </Badge>
            {profile.bio && (
              <p className="text-green-100 mt-2 text-sm">{profile.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userPosts.length}</div>
              <div className="text-green-100 text-sm">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{followersCount}</div>
              <div className="text-green-100 text-sm">Abonnés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile.following_count}</div>
              <div className="text-green-100 text-sm">Abonnements</div>
            </div>
          </div>

          {/* Follow Button */}
          {user && user.id !== profile.id && (
            <div className="mt-4">
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "secondary" : "default"}
                className={isFollowing ? "bg-white/20 text-white border-white/30" : "bg-white text-green-600 hover:bg-gray-100"}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Suivi
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Suivre
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Activité
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Statistiques
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Posts de {profile.display_name}</CardTitle>
              </CardHeader>
              <CardContent>
                {userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            {post.sport && post.match_teams && (
                              <div className="text-sm text-gray-600 mb-1">
                                {post.sport} • {post.match_teams}
                              </div>
                            )}
                            <p className="text-gray-800">{post.content}</p>
                            {post.prediction_text && (
                              <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                                <p className="text-green-800 font-medium">{post.prediction_text}</p>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-green-600">
                                  <span>Cote: {post.odds}</span>
                                  <span>Confiance: {post.confidence}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="mt-2 rounded-lg max-h-64 w-full object-cover"
                          />
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {post.likes}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.comments}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun post publié</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taux de réussite</span>
                    <span className="font-semibold text-green-600">{profile.success_rate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nombre de posts</span>
                    <span className="font-semibold">{userPosts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Badge</span>
                    <Badge variant="outline" className={getBadgeStyle(profile.badge)}>
                      {profile.badge}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default UserProfile;
