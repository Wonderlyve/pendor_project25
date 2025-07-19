
import { useState, useEffect } from 'react';

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

  const fetchChannels = async () => {
    setLoading(true);
    try {
      // Mock data until channels table is created
      const mockChannels: Channel[] = [
        {
          id: '1',
          name: 'Football',
          description: 'Pronostics football',
          creator_id: 'user1',
          is_private: false,
          price: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setChannels(mockChannels);
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
    // Mock implementation
    console.log('Creating channel:', channelData);
    return null;
  };

  const subscribeToChannel = async (channelId: string) => {
    // Mock implementation
    console.log('Subscribing to channel:', channelId);
    return true;
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
