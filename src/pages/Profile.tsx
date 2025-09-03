
import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Edit, Settings, Heart, MessageCircle, BarChart3, Trophy, Users, Star, Video } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFollows } from '@/hooks/useFollows';
import FollowsList from '@/components/FollowsList';
import FollowersListView from '@/components/FollowersListView';
import ImageViewer from '@/components/ImageViewer';

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

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const profileUserId = searchParams.get('userId') || user?.id;
  const isOwnProfile = profileUserId === user?.id;
  const { followersCount, followingCount, fetchCounts } = useFollows(profileUserId);
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    avatar_url: '',
    bio: '',
    badge: ''
  });
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [showFollowsList, setShowFollowsList] = useState<'followers' | 'following' | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    if (profileUserId) {
      fetchProfile();
      fetchUserPosts();
      if (isOwnProfile) {
        fetchSavedPosts();
      }
    }
  }, [profileUserId, isOwnProfile]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profileUserId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile({
          username: data.username || '',
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || '',
          bio: (data as any).bio || '',
          badge: data.badge || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!profileUserId) return;
    
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user posts:', error);
      } else {
        setUserPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    if (!user) return;
    
    setFavoritesLoading(true);
    try {
      // First get saved post IDs
      const { data: savedPosts, error: savedError } = await supabase
        .from('saved_posts')
        .select('post_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (savedError) {
        console.error('Error fetching saved posts:', savedError);
        return;
      }

      if (!savedPosts || savedPosts.length === 0) {
        setSavedPosts([]);
        return;
      }

      // Get post IDs
      const postIds = savedPosts.map(sp => sp.post_id);

      // Fetch posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      if (!posts) {
        setSavedPosts([]);
        return;
      }

      // Sort by saved date
      const sortedPosts = posts.sort((a, b) => {
        const aSavedInfo = savedPosts.find(sp => sp.post_id === a.id);
        const bSavedInfo = savedPosts.find(sp => sp.post_id === b.id);
        return new Date(bSavedInfo?.created_at || b.created_at).getTime() - 
               new Date(aSavedInfo?.created_at || a.created_at).getTime();
      });

      setSavedPosts(sortedPosts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        toast.error('Erreur lors de l\'upload de l\'image');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error('Erreur lors de la mise à jour du profil');
      } else {
        toast.success('Photo de profil mise à jour avec succès');
        setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la mise à jour de la photo');
    }
  };

  const updateProfile = async () => {
    if (!newDisplayName.trim()) {
      toast.error('Le nom d\'affichage ne peut pas être vide');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: newDisplayName.trim(),
          bio: newBio.trim()
        })
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Erreur lors de la mise à jour du profil');
      } else {
        toast.success('Profil mis à jour avec succès');
        setProfile(prev => ({ ...prev, display_name: newDisplayName.trim(), bio: newBio.trim() }));
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la mise à jour du profil');
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-6 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white mx-auto"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              size="icon"
              className="absolute bottom-0 right-0 w-8 h-8 bg-white text-gray-600 hover:bg-gray-100 rounded-full shadow-lg"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-white">
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <p className="text-green-100">@{profile.username}</p>
            {profile.badge && (
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                {profile.badge}
              </Badge>
            )}
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
            <div className="text-center cursor-pointer" onClick={() => setShowFollowsList('followers')}>
              <div className="text-2xl font-bold text-white">{followersCount}</div>
              <div className="text-green-100 text-sm">Abonnés</div>
            </div>
            <div className="text-center cursor-pointer" onClick={() => setShowFollowsList('following')}>
              <div className="text-2xl font-bold text-white">{followingCount}</div>
              <div className="text-green-100 text-sm">Abonnements</div>
            </div>
          </div>
        </div>
        
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setNewDisplayName(profile.display_name);
              setNewBio(profile.bio);
              setShowEditModal(true);
            }}
            className="absolute top-4 right-16 text-white hover:bg-white/20"
          >
            <Edit className="w-5 h-5" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 text-white hover:bg-white/20"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="pb-4">
        <Button
          onClick={() => navigate(`/my-briefings${profileUserId ? `?userId=${profileUserId}` : ''}`)}
          className="w-full bg-black hover:bg-gray-800 text-white rounded-none"
        >
          <Video className="w-4 h-4 mr-2" />
          Voir mes videos
        </Button>
      </div>

      {/* Tabs Section */}
      <div className="p-4">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Activité
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Favoris
            </TabsTrigger>
            <TabsTrigger value="followers" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Abonnés
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mes Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <p className="text-gray-500">Chargement des posts...</p>
                ) : userPosts.length > 0 ? (
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
                            className="mt-2 rounded-lg max-h-64 w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => {
                              setSelectedImageUrl(post.image_url || '');
                              setShowImageViewer(true);
                            }}
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
          
          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pronostics favoris</CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <p className="text-gray-500">Chargement des favoris...</p>
                ) : savedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {savedPosts.map((post) => (
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
                            className="mt-2 rounded-lg max-h-64 w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => {
                              setSelectedImageUrl(post.image_url || '');
                              setShowImageViewer(true);
                            }}
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
                  <p className="text-gray-500">Aucun favori enregistré</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="followers" className="mt-4">
            <FollowersListView userId={profileUserId || ''} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Modifier le profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed" htmlFor="name">
                  Nom d'affichage
                </label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Votre nom"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed" htmlFor="bio">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  placeholder="Petite description de vous"
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  Annuler
                </Button>
                <Button onClick={updateProfile}>
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Follows List Modal */}
      {showFollowsList && (
        <FollowsList
          isOpen={!!showFollowsList}
          onClose={() => setShowFollowsList(null)}
          userId={profileUserId || ''}
          type={showFollowsList}
        />
      )}
      
      {/* Image Viewer */}
      <ImageViewer
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={selectedImageUrl}
        altText="Image du post"
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
