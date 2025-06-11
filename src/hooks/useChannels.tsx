
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Channel {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  is_private: boolean;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching channels:', error);
        return;
      }

      setChannels(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async (channelData: {
    name: string;
    description: string;
    price: number;
  }) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: channelData.name,
          description: channelData.description,
          creator_id: user.id,
          price: channelData.price,
          is_private: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating channel:', error);
        toast.error('Erreur lors de la création du canal');
        return null;
      }

      toast.success('Canal créé avec succès');
      await fetchChannels();
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la création du canal');
      return null;
    }
  };

  const subscribeToChannel = async (channelId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return false;
    }

    try {
      const { error } = await supabase
        .from('channel_subscriptions')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          is_active: true
        });

      if (error) {
        console.error('Error subscribing to channel:', error);
        if (error.code === '23505') {
          toast.info('Vous êtes déjà abonné à ce canal');
        } else {
          toast.error('Erreur lors de l\'abonnement');
        }
        return false;
      }

      toast.success('Abonnement réussi');
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'abonnement');
      return false;
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return {
    channels,
    loading,
    createChannel,
    subscribeToChannel,
    refetch: fetchChannels
  };
};
