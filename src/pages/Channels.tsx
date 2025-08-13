
import { useState, useEffect } from 'react';
import { Plus, Lock, Users, MessageCircle, Crown, ArrowLeft, Search, X, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ChannelImageUpload } from '@/components/ChannelImageUpload';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import ChannelChat from '@/components/ChannelChat';
import { useAuth } from '@/hooks/useAuth';
import { useChannels, Channel } from '@/hooks/useChannels';
import { useChannelNotifications } from '@/hooks/useChannelNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'CDF': return 'FC';
    default: return '€';
  }
};

const Channels = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { channels, loading, createChannel: createChannelHook, subscribeToChannel, deleteChannel: deleteChannelHook, isSubscribed, shareChannel } = useChannels();
  const { getUnreadCountForChannel, markChannelNotificationsAsRead } = useChannelNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'EUR',
    subscription_code: '',
    image_url: ''
  });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  

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
      setNewChannel({ name: '', description: '', price: 0, currency: 'EUR', subscription_code: '', image_url: '' });
    }
  };

  const createFreeChannel = async () => {
    const defaultChannelData = {
      name: `Canal de ${userProfile?.username || user?.email?.split('@')[0] || 'Utilisateur'}`,
      description: 'Canal gratuit ouvert à tous',
      price: 0,
      currency: 'EUR'
    };

    const result = await createChannelHook(defaultChannelData);
    if (result) {
      setShowWarningDialog(false);
      toast.success('Canal gratuit créé avec succès !');
    }
  };

  const joinChannel = async (channel: Channel) => {
    // Marquer les notifications de ce canal comme lues
    await markChannelNotificationsAsRead(channel.id);
    
    // Les créateurs peuvent accéder directement à leurs canaux
    if (user?.id === channel.creator_id) {
      setSelectedChannel(channel);
    } else if (isSubscribed(channel.id)) {
      setSelectedChannel(channel);
    } else if (channel.price > 0) {
      // Rediriger vers la page d'abonnement pour les canaux payants
      navigate(`/channel-subscription/${channel.id}`);
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="text-white hover:bg-white/20"
          >
            {showSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Field */}
        {showSearch && (
          <div className="bg-white rounded-lg border p-3 shadow-sm">
            <Input
              type="text"
              placeholder="Rechercher des canaux par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus:ring-0 p-0 text-base"
              autoFocus
            />
          </div>
        )}

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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="channelPrice">Prix mensuel</Label>
                  <Input
                    id="channelPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newChannel.price}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="channelCurrency">Devise</Label>
                  <Select 
                    value={newChannel.currency} 
                    onValueChange={(value) => setNewChannel(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CDF">CDF (FC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newChannel.price > 0 && (
                <div>
                  <Label htmlFor="subscriptionCode">Code d'abonnement</Label>
                  <Input
                    id="subscriptionCode"
                    type="text"
                    placeholder="Code pour les abonnements"
                    value={newChannel.subscription_code}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, subscription_code: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Les utilisateurs pourront s'abonner avec ce code
                  </p>
                </div>
              )}
              <ChannelImageUpload
                onImageUrlChange={(url) => setNewChannel(prev => ({ ...prev, image_url: url || '' }))}
                currentImageUrl={newChannel.image_url}
              />
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
          <div className="bg-white rounded-lg border shadow-sm">
            {channels
              .filter(channel => 
                channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                channel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                channel.creator_username.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((channel, index) => (
              <div key={channel.id}>
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => joinChannel(channel)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Channel Thumbnail */}
                    <div className="w-16 h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {channel.image_url ? (
                        <img 
                          src={channel.image_url} 
                          alt={channel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {getUnreadCountForChannel(channel.id) > 0 && (
                        <div className="absolute -top-3 -right-3 bg-red-500 rounded-full min-w-[24px] h-6 flex items-center justify-center shadow-lg border-2 border-white z-10">
                          <span className="text-white text-xs font-bold px-1">
                            {getUnreadCountForChannel(channel.id) > 99 ? '99+' : getUnreadCountForChannel(channel.id)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">{channel.name}</h3>
                        <div className="font-bold text-green-600 text-sm ml-2">
                          {channel.price > 0 ? `${channel.price} ${getCurrencySymbol(channel.currency)}/mois` : 'Gratuit'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">{channel.creator_username}</span>
                        {channel.creator_badge && (
                          <Badge variant="outline" className="text-xs">
                            {channel.creator_badge}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {channel.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="w-3 h-3 mr-1" />
                          {channel.subscriber_count} abonnés
                        </div>
                        <div className="flex items-center space-x-2">
                          {user?.id === channel.creator_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                shareChannel(channel);
                              }}
                              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                              title="Partager le canal"
                            >
                              <Share2 className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {user?.id === channel.creator_id ? 'Gérer' : (isSubscribed(channel.id) ? 'Entrer' : 'Rejoindre')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {index < channels.filter(channel => 
                  channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  channel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  channel.creator_username.toLowerCase().includes(searchQuery.toLowerCase())
                ).length - 1 && (
                  <div className="border-b border-gray-200" />
                )}
              </div>
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
