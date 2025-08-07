import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Smartphone, Code, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useChannels } from '@/hooks/useChannels';
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

const ChannelSubscription = () => {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const { user } = useAuth();
  const { channels, subscribeToChannel } = useChannels();
  const [channel, setChannel] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [subscriptionCode, setSubscriptionCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (channelId && channels.length > 0) {
      const foundChannel = channels.find(c => c.id === channelId);
      setChannel(foundChannel);
    }
  }, [channelId, channels]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const paymentMethods = [
    {
      id: 'orange',
      name: 'Orange Money',
      icon: Smartphone,
      color: 'bg-orange-500',
      available: false
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: Smartphone,
      color: 'bg-green-600',
      available: false
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      icon: Smartphone,
      color: 'bg-red-500',
      available: false
    },
    {
      id: 'code',
      name: 'Code d\'abonnement',
      icon: Code,
      color: 'bg-blue-500',
      available: true
    }
  ];

  const handleSubscribeWithCode = async () => {
    if (!subscriptionCode.trim()) {
      toast.error('Veuillez entrer un code d\'abonnement');
      return;
    }

    if (!channel) {
      toast.error('Canal introuvable');
      return;
    }

    setLoading(true);
    try {
      // Vérifier si le code correspond au code du canal
      if (subscriptionCode.trim() === channel.subscription_code) {
        const success = await subscribeToChannel(channel.id);
        if (success) {
          toast.success('Abonnement réussi avec le code !');
          navigate('/channels');
        }
      } else {
        toast.error('Code d\'abonnement invalide');
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      toast.error('Erreur lors de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    if (methodId === 'code') {
      setSelectedPayment(methodId);
    } else {
      toast.info('Ce moyen de paiement sera disponible prochainement');
    }
  };

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/channels')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Abonnement</h1>
            <p className="text-primary-foreground/80 text-sm">Rejoignez ce canal VIP</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Channel Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>{channel.name}</span>
                </CardTitle>
                <p className="text-muted-foreground mt-2">{channel.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {channel.price} {getCurrencySymbol(channel.currency)}
                </div>
                <p className="text-sm text-muted-foreground">par mois</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">Créateur: {channel.creator_username}</span>
              {channel.creator_badge && (
                <Badge variant="outline" className="text-xs">
                  {channel.creator_badge}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Moyens de paiement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${!method.available ? 'opacity-50' : ''}`}
                onClick={() => handlePaymentMethodSelect(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${method.color}`}>
                      <method.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.available ? 'Disponible' : 'Bientôt disponible'}
                      </p>
                    </div>
                  </div>
                  {selectedPayment === method.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Code Subscription Form */}
        {selectedPayment === 'code' && (
          <Card>
            <CardHeader>
              <CardTitle>Code d'abonnement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="code">Entrez votre code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Votre code d'abonnement"
                  value={subscriptionCode}
                  onChange={(e) => setSubscriptionCode(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Demandez le code au créateur du canal
                </p>
              </div>
              <Button 
                onClick={handleSubscribeWithCode}
                disabled={loading || !subscriptionCode.trim()}
                className="w-full"
              >
                {loading ? 'Vérification...' : 'S\'abonner avec le code'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-primary">Paiement sécurisé</p>
                <p className="text-sm text-muted-foreground">
                  Tous vos paiements sont protégés et sécurisés
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChannelSubscription;