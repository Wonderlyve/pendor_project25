
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Channel {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  is_private: boolean;
  price: number;
  currency: string;
  subscription_code?: string;
  image_url?: string;
  share_code?: string;
  created_at: string;
  updated_at: string;
  creator_username?: string;
  creator_badge?: string;
  subscriber_count?: number;
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
  const [userSubscriptions, setUserSubscriptions] = useState<string[]>([]);
  const { user } = useAuth();

  const fetchChannels = async () => {
    setLoading(true);
    try {
      // Fetch channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('*');

      if (channelsError) throw channelsError;

      // Fetch user subscriptions if user is logged in
      if (user) {
        const { data: subscriptions } = await supabase
          .from('channel_subscriptions')
          .select('channel_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        setUserSubscriptions(subscriptions?.map(sub => sub.channel_id) || []);
      }

      // Fetch creators info for each channel
      const channelsWithMetadata = await Promise.all(
        (channelsData || []).map(async (channel: any) => {
          // Get creator profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, badge')
            .eq('user_id', channel.creator_id)
            .single();

          // Get subscriber count
          const { count } = await supabase
            .from('channel_subscriptions')
            .select('*', { count: 'exact' })
            .eq('channel_id', channel.id);

          return {
            ...channel,
            creator_username: profile?.username || 'Utilisateur',
            creator_badge: profile?.badge,
            subscriber_count: count || 0
          };
        })
      );

      setChannels(channelsWithMetadata);
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('Erreur lors du chargement des canaux');
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async (channelData: {
    name: string;
    description: string;
    price: number;
    currency: string;
    subscription_code?: string;
    image_url?: string;
  }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un canal');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: channelData.name,
          description: channelData.description,
          price: channelData.price,
          currency: channelData.currency,
          subscription_code: channelData.subscription_code,
          image_url: channelData.image_url,
          creator_id: user.id,
          is_private: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Canal créé avec succès');
      await fetchChannels(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Erreur lors de la création du canal');
      return null;
    }
  };

  const subscribeToChannel = async (channelId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
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

      if (error) throw error;

      toast.success('Abonnement réussi !');
      await fetchChannels(); // Refresh to update subscriber count
      return true;
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      toast.error('Erreur lors de l\'abonnement');
      return false;
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const isSubscribed = (channelId: string) => {
    return userSubscriptions.includes(channelId);
  };

  const deleteChannel = async (channelId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer un canal');
      return false;
    }

    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast.success('Canal supprimé avec succès');
      await fetchChannels(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Erreur lors de la suppression du canal');
      return false;
    }
  };

  const getChannelByShareCode = async (shareCode: string) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('share_code', shareCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching channel by share code:', error);
      return null;
    }
  };

  const generateShareLink = (channel: Channel) => {
    if (!channel.share_code) return null;
    return `${window.location.origin}/join-channel/${channel.share_code}`;
  };

  const shareChannel = async (channel: Channel) => {
    const shareLink = generateShareLink(channel);
    if (!shareLink) {
      toast.error('Impossible de générer le lien de partage');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Rejoignez le canal ${channel.name}`,
          text: `Découvrez les analyses exclusives de ${channel.creator_username}`,
          url: shareLink
        });
      } else {
        await navigator.clipboard.writeText(shareLink);
        toast.success('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      console.error('Error sharing channel:', error);
      toast.error('Erreur lors du partage');
    }
  };

  return {
    channels,
    loading,
    userSubscriptions,
    createChannel,
    subscribeToChannel,
    deleteChannel,
    isSubscribed,
    getChannelByShareCode,
    shareChannel,
    generateShareLink,
    refetch: fetchChannels
  };
};
