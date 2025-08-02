import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useChannelMessages, ChannelMessage } from '@/hooks/useChannelMessages';
import { useVipPronos } from '@/hooks/useVipPronos';
import { useDebriefings } from '@/hooks/useDebriefings';
import { supabase } from '@/integrations/supabase/client';
import ChatHeader from './channel-chat/ChatHeader';
import MessagesList from './channel-chat/MessagesList';
import MediaInput from './channel-chat/MediaInput';
import MessageReply from './channel-chat/MessageReply';
import VipPronoModal, { VipPronoData } from './channel-chat/VipPronoModal';
import DebriefingModal, { DebriefingData } from './channel-chat/DebriefingModal';
import VipPronoCard from './channel-chat/VipPronoCard';

interface ChannelInfo {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  creator_username?: string;
  creator_badge?: string;
  subscriber_count?: number;
}

interface ChannelChatProps {
  channelId: string;
  channelName: string;
  onBack: () => void;
}

const ChannelChat = ({ channelId, channelName, onBack }: ChannelChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChannelMessage | null>(null);
  const [showVipPronoModal, setShowVipPronoModal] = useState(false);
  const [showDebriefingModal, setShowDebriefingModal] = useState(false);

  // Fetch channel info first, then use it to initialize the messages hook
  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        const { data: channelData, error: channelError } = await supabase
          .from('channels')
          .select('*')
          .eq('id', channelId)
          .single();

        if (channelError) throw channelError;

        // Get creator profile separately
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, badge')
          .eq('user_id', channelData.creator_id)
          .single();

        const { count } = await supabase
          .from('channel_subscriptions')
          .select('*', { count: 'exact' })
          .eq('channel_id', channelId);

        setChannelInfo({
          ...channelData,
          creator_username: profileData?.username || 'Utilisateur',
          creator_badge: profileData?.badge,
          subscriber_count: count || 0
        });
      } catch (error) {
        console.error('Error fetching channel info:', error);
      }
    };

    fetchChannelInfo();
  }, [channelId]);

  const { 
    messages, 
    loading, 
    isCreator, 
    isSubscribed,
    sendMessage: sendChannelMessage,
    editMessage,
    deleteMessage
  } = useChannelMessages(
    channelId, 
    channelInfo?.creator_id || ''
  );

  const { pronos, createVipProno } = useVipPronos(channelId);
  const { debriefings, createDebriefing, likeDebriefing, deleteDebriefing } = useDebriefings(channelId);

  const handleSendMessage = async (mediaFiles?: File[]) => {
    if (!newMessage.trim() && !mediaFiles?.length) return;
    
    const replyData = replyingTo ? {
      id: replyingTo.id,
      content: replyingTo.content,
      username: replyingTo.username,
      media_type: replyingTo.media_type
    } : undefined;
    
    const success = await sendChannelMessage(newMessage, mediaFiles, replyData);
    if (success) {
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const handleReply = (message: ChannelMessage) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCreateVipProno = async (pronoData: VipPronoData) => {
    const success = await createVipProno({
      ...pronoData,
      channelId
    });
    
    if (success) {
      setShowVipPronoModal(false);
    }
  };

  const handleCreateDebriefing = async (debriefingData: DebriefingData) => {
    const success = await createDebriefing({
      ...debriefingData,
      channelId
    });
    
    if (success) {
      setShowDebriefingModal(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <ChatHeader 
        channelName={channelName}
        channelInfo={channelInfo}
        onBack={onBack}
        onCreateVipProno={() => setShowVipPronoModal(true)}
        onCreateDebriefing={() => setShowDebriefingModal(true)}
        className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200"
      />
      
      <div className="flex-1 pt-16 pb-24">
        <MessagesList 
          messages={messages}
          pronos={pronos}
          debriefings={debriefings}
          loading={loading}
          isCreator={isCreator}
          creatorId={channelInfo?.creator_id}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          onReply={handleReply}
          onReplyToProno={(prono) => {
            setReplyingTo({
              id: `prono-${prono.id}`,
              content: `${prono.description} - ${prono.prediction_text}`,
              username: prono.creator_username || 'Créateur',
              user_id: prono.creator_id,
              created_at: prono.created_at,
              media_url: null,
              media_type: null,
              media_filename: null
            } as any);
          }}
          onLikeDebriefing={likeDebriefing}
          onDeleteDebriefing={isCreator ? deleteDebriefing : undefined}
        />
      </div>
      
      {(isCreator || isSubscribed) ? (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-50">
          <MessageReply 
            replyingTo={replyingTo}
            onCancelReply={handleCancelReply}
          />
          <MediaInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
          />
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="text-center py-2">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Vous devez être abonné pour écrire dans ce canal</span>
            </div>
          </div>
        </div>
      )}

      <VipPronoModal
        isOpen={showVipPronoModal}
        onClose={() => setShowVipPronoModal(false)}
        onSubmit={handleCreateVipProno}
      />

      <DebriefingModal
        isOpen={showDebriefingModal}
        onClose={() => setShowDebriefingModal(false)}
        onSubmit={handleCreateDebriefing}
      />
    </div>
  );
};

export default ChannelChat;