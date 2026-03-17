import { useState } from 'react';
import { Smartphone, Loader2, Phone } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MobileMoneyPaymentProps {
  channelId: string;
  channelName: string;
  price: number;
  currency: string;
  onSuccess: () => void;
}

const providers = [
  { id: 'orange_money', name: 'Orange Money', color: 'bg-orange-500', prefix: '+243' },
  { id: 'mpesa', name: 'M-Pesa', color: 'bg-green-600', prefix: '+243' },
  { id: 'airtel_money', name: 'Airtel Money', color: 'bg-red-500', prefix: '+243' },
];

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'CDF': return 'FC';
    default: return '€';
  }
};

const MobileMoneyPayment = ({ channelId, channelName, price, currency, onSuccess }: MobileMoneyPaymentProps) => {
  const { user } = useAuth();
  const [provider, setProvider] = useState('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedProvider = providers.find(p => p.id === provider);

  const handleSubmit = async () => {
    if (!user) return;
    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mobile_money_payments' as any)
        .insert({
          user_id: user.id,
          channel_id: channelId,
          phone_number: phoneNumber.trim(),
          provider,
          amount: price,
          currency,
          status: 'pending',
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Demande de paiement envoyée !');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6 text-center space-y-3">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Demande envoyée !</h3>
          <p className="text-sm text-muted-foreground">
            Envoyez <strong>{price} {getCurrencySymbol(currency)}</strong> au numéro du créateur du canal via <strong>{selectedProvider?.name}</strong>.
          </p>
          <div className="bg-muted rounded-lg p-3 text-sm">
            <p className="font-medium">Instructions :</p>
            <ol className="text-left list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Envoyez {price} {getCurrencySymbol(currency)} via {selectedProvider?.name}</li>
              <li>L'administrateur vérifiera votre paiement</li>
              <li>Votre accès sera activé après validation</li>
            </ol>
          </div>
          <Button variant="outline" onClick={() => onSuccess()} className="w-full">
            Retour aux canaux
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Paiement Mobile Money
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Fournisseur</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${p.color}`} />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="Ex: 0812345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
              className="pl-10"
              maxLength={15}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Le numéro depuis lequel vous enverrez le paiement
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Montant à payer</span>
            <span className="text-lg font-bold text-primary">
              {price} {getCurrencySymbol(currency)}
            </span>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !phoneNumber.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 mr-2" />
              Envoyer la demande de paiement
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileMoneyPayment;
