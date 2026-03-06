import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ChannelMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio' | 'file';
  media_filename?: string;
  reply_to_id?: string;
  reply_to_content?: string;
  reply_to_username?: string;
  reply_to_media_type?: string;
}

export const useChannelMessages = (channelId: string, creatorId: string) => {
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isCreator = user?.id === creatorId;

  // Vérifier si l'utilisateur est abonné au canal
  const [isSubscribed, setIsSubscribed] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('channel_subscriptions')
        .select('is_active')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .single();
      
      setIsSubscribed(data?.is_active || isCreator);
    } catch (error) {
      setIsSubscribed(isCreator);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('channel_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles for each message separately
      const messagesWithProfile = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', message.user_id)
            .single();

           return {
             ...message,
             username: profile?.username || 'Utilisateur',
             avatar_url: profile?.avatar_url,
             media_type: message.media_type as 'image' | 'video' | 'audio' | 'file' | undefined
           };
        })
      );

      setMessages(messagesWithProfile);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const addOptimisticMessage = (messageData: any) => {
    const optimisticMsg: ChannelMessage = {
      id: messageData.id || `temp-${Date.now()}`,
      channel_id: channelId,
      user_id: user!.id,
      content: messageData.content,
      created_at: new Date().toISOString(),
      username: undefined, // will be filled by profile lookup
      avatar_url: undefined,
      media_url: messageData.media_url,
      media_type: messageData.media_type,
      media_filename: messageData.media_filename,
      reply_to_id: messageData.reply_to_id,
      reply_to_content: messageData.reply_to_content,
      reply_to_username: messageData.reply_to_username,
      reply_to_media_type: messageData.reply_to_media_type,
    };

    // Get profile for display
    supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('user_id', user!.id)
      .single()
      .then(({ data: profile }) => {
        optimisticMsg.username = profile?.username || 'Utilisateur';
        optimisticMsg.avatar_url = profile?.avatar_url;
      });

    return optimisticMsg;
  };

  const sendMessage = async (content: string, mediaFiles?: File[], replyTo?: { id: string; content?: string; username?: string; media_type?: string }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer des messages');
      return false;
    }

    if (!isSubscribed && !isCreator) {
      toast.error('Vous devez être abonné au canal pour écrire des messages');
      return false;
    }

    if (!content.trim() && (!mediaFiles || mediaFiles.length === 0)) {
      toast.error('Veuillez saisir un message ou ajouter un fichier');
      return false;
    }

    // Get user profile once for optimistic updates
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('user_id', user.id)
      .single();

    try {
      if (mediaFiles && mediaFiles.length > 0) {
        let allUploadsSuccessful = true;
        
        for (const file of mediaFiles) {
          try {
            const fileExt = file.name.split('.').pop() || 'bin';
            const fileName = `${channelId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('channel-media')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              if (uploadError.message.includes('bucket')) {
                toast.error('Bucket de stockage non configuré. Contactez l\'administrateur.');
                allUploadsSuccessful = false;
                continue;
              }
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('channel-media')
              .getPublicUrl(fileName);

            const mediaType = file.type.startsWith('image/') ? 'image' : 
                             file.type.startsWith('video/') ? 'video' : 
                             file.type.startsWith('audio/') ? 'audio' : 'file';

            const insertData = {
              channel_id: channelId,
              user_id: user.id,
              content: content.trim() || `Fichier: ${file.name}`,
              media_url: publicUrl,
              media_type: mediaType,
              media_filename: file.name,
              reply_to_id: replyTo?.id || null,
              reply_to_content: replyTo?.content || null,
              reply_to_username: replyTo?.username || null,
              reply_to_media_type: replyTo?.media_type || null
            };

            const { data: inserted, error: insertError } = await supabase
              .from('channel_messages')
              .insert(insertData)
              .select()
              .single();

            if (insertError) throw insertError;

            // Optimistic: add to messages immediately
            if (inserted) {
              setMessages(prev => {
                if (prev.some(m => m.id === inserted.id)) return prev;
                return [...prev, {
                  ...inserted,
                  username: userProfile?.username || 'Utilisateur',
                  avatar_url: userProfile?.avatar_url,
                  media_type: inserted.media_type as any,
                }];
              });
            }
            
          } catch (fileError) {
            console.error('Error uploading file:', file.name, fileError);
            toast.error(`Erreur lors de l'envoi de ${file.name}`);
            allUploadsSuccessful = false;
          }
        }

        return allUploadsSuccessful;
        
      } else {
        const insertData = {
          channel_id: channelId,
          user_id: user.id,
          content: content.trim(),
          media_url: null,
          media_type: null,
          media_filename: null,
          reply_to_id: replyTo?.id || null,
          reply_to_content: replyTo?.content || null,
          reply_to_username: replyTo?.username || null,
          reply_to_media_type: replyTo?.media_type || null
        };

        const { data: inserted, error } = await supabase
          .from('channel_messages')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Optimistic: add to messages immediately
        if (inserted) {
          setMessages(prev => {
            if (prev.some(m => m.id === inserted.id)) return prev;
            return [...prev, {
              ...inserted,
              username: userProfile?.username || 'Utilisateur',
              avatar_url: userProfile?.avatar_url,
              media_type: inserted.media_type as any,
            }];
          });
        }

        return true;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      return false;
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour modifier un message');
      return false;
    }

    try {
      const { error } = await supabase
        .from('channel_messages')
        .update({ content: newContent.trim() })
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchMessages(); // Refresh messages
      toast.success('Message modifié avec succès');
      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Erreur lors de la modification du message');
      return false;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer un message');
      return false;
    }

    try {
      const { error } = await supabase
        .from('channel_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchMessages(); // Refresh messages
      toast.success('Message supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression du message');
      return false;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, channelId]);

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription with unique channel name
    const realtimeChannel = supabase
      .channel(`channel-messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === payload.new.id);
            if (exists) return prev;
            
            // We'll add the message immediately with placeholder data, then update
            return prev;
          });
          
          // Fetch the complete message with user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const formattedMessage: ChannelMessage = {
            id: payload.new.id,
            channel_id: payload.new.channel_id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            username: profile?.username || 'Utilisateur',
            avatar_url: profile?.avatar_url,
            media_url: payload.new.media_url,
            media_type: payload.new.media_type as 'image' | 'video' | 'audio' | 'file' | undefined,
            media_filename: payload.new.media_filename,
            reply_to_id: payload.new.reply_to_id,
            reply_to_content: payload.new.reply_to_content,
            reply_to_username: payload.new.reply_to_username,
            reply_to_media_type: payload.new.reply_to_media_type
          };
          
          setMessages(prev => {
            // Check again to avoid duplicates
            const exists = prev.some(msg => msg.id === formattedMessage.id);
            if (exists) return prev;
            return [...prev, formattedMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          // Update the message in place
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          setMessages(prev => prev.map(msg => {
            if (msg.id === payload.new.id) {
              return {
                ...msg,
                content: payload.new.content,
                media_url: payload.new.media_url,
                media_type: payload.new.media_type as 'image' | 'video' | 'audio' | 'file' | undefined,
                media_filename: payload.new.media_filename,
                username: profile?.username || msg.username,
                avatar_url: profile?.avatar_url || msg.avatar_url
              };
            }
            return msg;
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          // Remove the deleted message
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [channelId]);

  return {
    messages,
    loading,
    isCreator,
    isSubscribed,
    sendMessage,
    editMessage,
    deleteMessage
  };
};