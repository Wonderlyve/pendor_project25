import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Edit, Settings, Heart, MessageCircle, BarChart3, Trophy, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    avatar_url: '',
    bio: '',
    badge: ''
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newBio, setNewBio] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile({
          username: data.username || '',
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          badge: data.badge || ''
        });
      }
    } finally {
      setLoading(false);
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
        .eq('id', user?.id);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-6 relative">
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
            <Button
              size="icon"
              className="absolute bottom-0 right-0 w-8 h-8 bg-white text-gray-600 hover:bg-gray-100 rounded-full shadow-lg"
              onClick={() => setShowEditModal(true)}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-white">
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <p className="text-blue-100">@{profile.username}</p>
            {profile.badge && (
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                {profile.badge}
              </Badge>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 text-white hover:bg-white/20"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs Section */}
      <div className="p-4">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Activité
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Favoris
            </TabsTrigger>
            <TabsTrigger value="followers" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Abonnés
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Dernière activité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Aucune activité récente</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pronostics favoris</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Aucun favori enregistré</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="followers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Abonnés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Aucun abonné pour le moment</p>
              </CardContent>
            </Card>
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
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
