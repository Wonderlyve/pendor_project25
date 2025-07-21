
import { useState, useEffect } from 'react';
import { Plus, Lock, Users, MessageCircle, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import ChannelChat from '@/components/ChannelChat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  is_private: boolean;
  price: number;
  created_at: string;
  creator_username?: string;
  creator_badge?: string;
  subscriber_count?: number;
}

const Channels = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    price: 0
  });

  const isPro = user?.user_metadata?.badge === 'Pro' || user?.user_metadata?.badge === 'Expert';
  const isSpecialUser = user?.email === 'c.batuemi@gmail.com';
  const canCreateChannel = isPro || isSpecialUser;

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      // Stub for channels - return empty array for now
      setChannels([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async () => {
    toast.info('Fonctionnalité de canaux à venir bientôt');
  };

  const joinChannel = async (channel: Channel) => {
    toast.info('Fonctionnalité de canaux à venir bientôt');
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
        {/* Create Channel Button for Pro Users or Special User */}
        {canCreateChannel && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Créer un canal VIP
              </Button>
            </DialogTrigger>
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
        )}

        {/* Info Card for Non-Pro Users (except special user) */}
        {!canCreateChannel && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-2">Devenez Pronostiqueur Pro</h3>
              <p className="text-gray-500 text-sm">
                Seuls les pronostiqueurs certifiés Pro peuvent créer des canaux VIP
              </p>
            </CardContent>
          </Card>
        )}

        {/* Channels List */}
        {channels.length > 0 ? (
          <div className="space-y-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Lock className="w-4 h-4 text-orange-500" />
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                      </div>
                      <p className="text-gray-600 text-sm">{channel.description}</p>
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
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.creator_id}`}
                          alt="Creator"
                          className="w-6 h-6 rounded-full"
                        />
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
                    <Button
                      size="sm"
                      onClick={() => joinChannel(channel)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Rejoindre
                    </Button>
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
