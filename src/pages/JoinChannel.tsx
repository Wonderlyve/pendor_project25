import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Crown, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useChannels } from '@/hooks/useChannels';
import { toast } from 'sonner';

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'CDF': return 'FC';
    default: return '€';
  }
};

const JoinChannel = () => {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getChannelByShareCode, subscribeToChannel, isSubscribed } = useChannels();
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchChannel = async () => {
      if (!shareCode) {
        setLoading(false);
        return;
      }

      try {
        const channelData = await getChannelByShareCode(shareCode);
        setChannel(channelData);
      } catch (error) {
        console.error('Error fetching channel:', error);
        toast.error('Canal introuvable');
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [shareCode, getChannelByShareCode]);

  const handleJoinChannel = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!channel) return;

    // Si l'utilisateur est déjà abonné, rediriger vers les canaux
    if (isSubscribed(channel.id)) {
      navigate('/channels');
      return;
    }

    setSubscribing(true);
    try {
      if (channel.price > 0) {
        // Rediriger vers la page d'abonnement pour les canaux payants
        navigate(`/channel-subscription/${channel.id}`);
      } else {
        // S'abonner directement aux canaux gratuits
        const success = await subscribeToChannel(channel.id);
        if (success) {
          toast.success('Vous avez rejoint le canal avec succès !');
          navigate('/channels');
        }
      }
    } catch (error) {
      console.error('Error joining channel:', error);
      toast.error('Erreur lors de l\'adhésion au canal');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement du canal...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Canal introuvable</h1>
              <p className="text-primary-foreground/80 text-sm">Le lien semble invalide</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Canal introuvable</h3>
              <p className="text-muted-foreground mb-4">
                Ce lien d'invitation semble invalide ou expiré.
              </p>
              <Button onClick={() => navigate('/channels')} className="w-full">
                Voir tous les canaux
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isAlreadySubscribed = user && isSubscribed(channel.id);
  const isOwner = user?.id === channel.creator_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Invitation canal</h1>
            <p className="text-primary-foreground/80 text-sm">Rejoignez ce canal VIP</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              {channel.image_url ? (
                <img 
                  src={channel.image_url} 
                  alt={channel.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Crown className="w-12 h-12 text-primary-foreground" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-center text-xl mb-2">{channel.name}</CardTitle>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-muted-foreground">Créé par</span>
                <span className="font-medium">{channel.creator_username}</span>
                {channel.creator_badge && (
                  <Badge variant="outline" className="text-xs">
                    {channel.creator_badge}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{channel.subscriber_count || 0} abonnés</span>
                </div>
                <div className="text-lg font-bold text-primary">
                  {channel.price > 0 ? `${channel.price} ${getCurrencySymbol(channel.currency)}/mois` : 'Gratuit'}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{channel.description}</p>
              </div>

              {isOwner ? (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <Check className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-medium text-primary">C'est votre canal</p>
                  <p className="text-sm text-muted-foreground">Vous êtes le créateur de ce canal</p>
                </div>
              ) : isAlreadySubscribed ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-700">Déjà abonné</p>
                  <p className="text-sm text-green-600">Vous êtes déjà membre de ce canal</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {!user && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                      <p className="text-amber-700 font-medium">Connexion requise</p>
                      <p className="text-sm text-amber-600">Vous devez être connecté pour rejoindre ce canal</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleJoinChannel}
                    disabled={subscribing}
                    className="w-full"
                    size="lg"
                  >
                    {subscribing ? 'Traitement...' : (
                      channel.price > 0 ? 'S\'abonner maintenant' : 'Rejoindre gratuitement'
                    )}
                  </Button>
                </div>
              )}

              {(isOwner || isAlreadySubscribed) && (
                <Button 
                  onClick={() => navigate('/channels')}
                  variant="outline"
                  className="w-full"
                >
                  Voir mes canaux
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinChannel;