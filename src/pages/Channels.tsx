
import { useState, useEffect } from 'react';
import { Plus, Lock, Users, MessageCircle, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import ChannelChat from '@/components/ChannelChat';
import { useAuth } from '@/hooks/useAuth';
import { useChannels, Channel } from '@/hooks/useChannels';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Channels = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { channels, loading, createChannel: createChannelHook, subscribeToChannel, isSubscribed } = useChannels();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    price: 0
  });
  

  // Check user badge from profiles table
  const [userProfile, setUserProfile] = useState<any>(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('badge, username')
          .eq('user_id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  const isPro = userProfile?.badge === 'Pro' || userProfile?.badge === 'Expert';
  const isSpecialUser = user?.email === 'Padmin@pendor.com';
  const canCreateChannel = isPro || isSpecialUser;

  // Listen for channel creation events from BottomNavigation
  useEffect(() => {
    const handleCreateChannel = () => {
      if (canCreateChannel) {
        setShowCreateModal(true);
      } else {
        setShowWarningDialog(true);
      }
    };

    window.addEventListener('createChannel', handleCreateChannel);
    return () => window.removeEventListener('createChannel', handleCreateChannel);
  }, [canCreateChannel]);

  const createChannel = async () => {
    if (!newChannel.name.trim()) {
      toast.error('Le nom du canal est requis');
      return;
    }

    const result = await createChannelHook(newChannel);
    if (result) {
      setShowCreateModal(false);
      setNewChannel({ name: '', description: '', price: 0 });
    }
  };

  const createFreeChannel = async () => {
    const defaultChannelData = {
      name: `Canal de ${userProfile?.username || user?.email?.split('@')[0] || 'Utilisateur'}`,
      description: 'Canal gratuit ouvert à tous',
      price: 0
    };

    const result = await createChannelHook(defaultChannelData);
    if (result) {
      setShowWarningDialog(false);
      toast.success('Canal gratuit créé avec succès !');
    }
  };

  const joinChannel = async (channel: Channel) => {
    if (isSubscribed(channel.id)) {
      setSelectedChannel(channel);
    } else {
      await subscribeToChannel(channel.id);
    }
  };


  if (selectedChannel) {
    return (
      <ChannelChat
        channelId={selectedChannel.id}
        channelName={selectedChannel.name}
        onBack={() => setSelectedChannel(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Canaux VIP</h1>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement des canaux...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Canaux VIP</h1>
              <p className="text-green-100 text-sm">Analyses exclusives des pros</p>
            </div>
          </div>
          <Crown className="w-8 h-8 text-yellow-300" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Create Channel Button - Visible for all users */}
        <Button 
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white"
          onClick={() => {
            if (canCreateChannel) {
              setShowCreateModal(true);
            } else {
              setShowWarningDialog(true);
            }
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Créer un canal VIP
        </Button>

        {/* Create Channel Modal - Only for Pro Users */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau canal VIP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="channelName">Nom du canal</Label>
                <Input
                  id="channelName"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Analyses Premium Football"
                />
              </div>
              <div>
                <Label htmlFor="channelDescription">Description</Label>
                <Textarea
                  id="channelDescription"
                  value={newChannel.description}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez ce que vos abonnés recevront..."
                />
              </div>
              <div>
                <Label htmlFor="channelPrice">Prix mensuel (€)</Label>
                <Input
                  id="channelPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newChannel.price}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <Button onClick={createChannel} className="w-full">
                Créer le canal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Warning Dialog for Non-Pro Users */}
        <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span>Fonctionnalité Pro uniquement</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Seuls les pronostiqueurs certifiés Pro peuvent créer des canaux VIP. 
                Obtenez votre certification Pro pour accéder à cette fonctionnalité exclusive 
                et commencer à monétiser vos analyses sportives.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <div className="flex space-x-2 w-full">
                <Button 
                  onClick={() => setShowWarningDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Compris
                </Button>
                <Button 
                  onClick={createFreeChannel}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Créer un canal gratuit
                </Button>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Channels List */}
        {channels.length > 0 ? (
          <div className="space-y-4">
            {channels.map((channel) => (
              <Card 
                key={channel.id} 
                className="overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => joinChannel(channel)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Lock className="w-4 h-4 text-orange-500" />
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {channel.description.length > 30 
                          ? `${channel.description.substring(0, 30)}... voir tout`
                          : channel.description
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {channel.price > 0 ? `${channel.price}€/mois` : 'Gratuit'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{channel.creator_username}</span>
                        {channel.creator_badge && (
                          <Badge variant="outline" className="text-xs">
                            {channel.creator_badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {channel.subscriber_count} abonnés
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {isSubscribed(channel.id) ? 'Entrer' : 'Rejoindre'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun canal disponible</h3>
            <p className="text-gray-500">Les premiers canaux VIP arrivent bientôt !</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Channels;
