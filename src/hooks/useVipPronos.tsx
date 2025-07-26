import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { VipPronoData } from '@/components/channel-chat/VipPronoModal';

export interface VipProno {
  id: string;
  channel_id: string;
  creator_id: string;
  total_odds: number;
  image_url?: string;
  description: string;
  prediction_text: string;
  created_at: string;
  updated_at: string;
  creator_username?: string;
}

export const useVipPronos = (channelId: string) => {
  const { user } = useAuth();
  const [pronos, setPronos] = useState<VipProno[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVipPronos = async () => {
    if (!channelId) return;

    try {
      const { data, error } = await supabase
        .from('vip_pronos')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching VIP pronos:', error);
        return;
      }

      // Fetch creator usernames separately
      const pronosWithUsernames = await Promise.all(
        (data || []).map(async (prono) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', prono.creator_id)
            .single();

          return {
            ...prono,
            creator_username: profile?.username || 'Utilisateur inconnu'
          };
        })
      );

      setPronos(pronosWithUsernames);
    } catch (error) {
      console.error('Error fetching VIP pronos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVipProno = async (pronoData: VipPronoData & { channelId: string }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un prono VIP');
      return false;
    }

    try {
      let imageUrl = null;

      // Upload image if provided
      if (pronoData.image) {
        const fileExt = pronoData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${channelId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('channel-media')
          .upload(filePath, pronoData.image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Erreur lors du téléchargement de l\'image');
          return false;
        }

        const { data: urlData } = supabase.storage
          .from('channel-media')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('vip_pronos')
        .insert({
          channel_id: pronoData.channelId,
          creator_id: user.id,
          total_odds: parseFloat(pronoData.totalOdds),
          image_url: imageUrl,
          description: pronoData.description,
          prediction_text: pronoData.predictionText
        });

      if (error) {
        console.error('Error creating VIP prono:', error);
        toast.error('Erreur lors de la création du prono VIP');
        return false;
      }

      toast.success('Prono VIP créé avec succès !');
      fetchVipPronos(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error creating VIP prono:', error);
      toast.error('Erreur lors de la création du prono VIP');
      return false;
    }
  };

  useEffect(() => {
    fetchVipPronos();
  }, [channelId]);

  // Real-time subscription
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel('vip_pronos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vip_pronos',
          filter: `channel_id=eq.${channelId}`
        },
        () => {
          fetchVipPronos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return {
    pronos,
    loading,
    createVipProno,
    refetch: fetchVipPronos
  };
};