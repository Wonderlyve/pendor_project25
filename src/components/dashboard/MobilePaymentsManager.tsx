import { useState, useEffect } from 'react';
import { Smartphone, Check, X, Loader2, RefreshCw } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MobilePayment {
  id: string;
  user_id: string;
  channel_id: string;
  phone_number: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  validated_at: string | null;
  username?: string;
  channel_name?: string;
}

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'CDF': return 'FC';
    default: return '€';
  }
};

const providerLabels: Record<string, string> = {
  orange_money: 'Orange Money',
  mpesa: 'M-Pesa',
  airtel_money: 'Airtel Money',
};

const MobilePaymentsManager = () => {
  const [payments, setPayments] = useState<MobilePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mobile_money_payments' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with user and channel info
      const enriched = await Promise.all(
        ((data as any[]) || []).map(async (payment: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', payment.user_id)
            .single();

          const { data: channel } = await supabase
            .from('channels')
            .select('name')
            .eq('id', payment.channel_id)
            .single();

          return {
            ...payment,
            username: profile?.display_name || profile?.username || 'Inconnu',
            channel_name: channel?.name || 'Canal supprimé',
          };
        })
      );

      setPayments(enriched);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (payment: MobilePayment) => {
    setProcessingId(payment.id);
    try {
      // Update payment status
      const { error: updateError } = await supabase
        .from('mobile_money_payments' as any)
        .update({ status: 'approved', validated_at: new Date().toISOString() } as any)
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Activate subscription
      const { error: subError } = await supabase
        .from('channel_subscriptions')
        .insert({
          channel_id: payment.channel_id,
          user_id: payment.user_id,
          is_active: true,
        });

      if (subError) throw subError;

      toast.success('Paiement approuvé et abonnement activé !');
      fetchPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const { error } = await supabase
        .from('mobile_money_payments' as any)
        .update({ status: 'rejected', validated_at: new Date().toISOString() } as any)
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Paiement rejeté');
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Paiements Mobile Money
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">Aucun paiement Mobile Money</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{payment.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Canal: {payment.channel_name}
                    </p>
                  </div>
                  {statusBadge(payment.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Fournisseur: </span>
                    <span className="font-medium">{providerLabels[payment.provider] || payment.provider}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Téléphone: </span>
                    <span className="font-medium">{payment.phone_number}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Montant: </span>
                    <span className="font-bold text-primary">{payment.amount} {getCurrencySymbol(payment.currency)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date: </span>
                    <span>{new Date(payment.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {payment.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(payment)}
                      disabled={processingId === payment.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingId === payment.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Approuver
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(payment.id)}
                      disabled={processingId === payment.id}
                      className="flex-1"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobilePaymentsManager;
