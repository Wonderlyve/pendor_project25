import { useState, useEffect, useRef } from 'react';
import { Lock, ArrowDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChannelMessage } from '@/hooks/useChannelMessages';
import { VipProno } from '@/hooks/useVipPronos';
import { Debriefing } from '@/hooks/useDebriefings';
import MessageBubble from './MessageBubble';
import VipPronoCard from './VipPronoCard';
import DebriefingCard from './DebriefingCard';

interface MessagesListProps {
  messages: ChannelMessage[];
  pronos: VipProno[];
  debriefings: Debriefing[];
  loading: boolean;
  isCreator: boolean;
  creatorId?: string;
  onEditMessage?: (messageId: string, newContent: string) => Promise<boolean>;
  onDeleteMessage?: (messageId: string) => Promise<boolean>;
  onReply?: (message: ChannelMessage) => void;
  onReplyToProno?: (prono: VipProno) => void;
  onLikeDebriefing: (debriefingId: string) => void;
  onDeleteDebriefing?: (debriefingId: string) => void;
}

const MessagesList = ({ messages, pronos, debriefings, loading, isCreator, creatorId, onEditMessage, onDeleteMessage, onReply, onReplyToProno, onLikeDebriefing, onDeleteDebriefing }: MessagesListProps) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combiner messages, pronos et débriefings par ordre chronologique
  const combinedItems = [
    ...messages.map(msg => ({ ...msg, type: 'message' as const })),
    ...pronos.map(prono => ({ ...prono, type: 'prono' as const })),
    ...debriefings.map(debriefing => ({ ...debriefing, type: 'debriefing' as const }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Auto-scroll au bas à l'ouverture et quand de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current && combinedItems.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combinedItems.length]);

  // Détecter le scroll pour afficher/masquer le bouton
  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && combinedItems.length > 0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (combinedItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun message pour le moment
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {isCreator 
              ? 'Écrivez le premier message pour démarrer la conversation avec vos abonnés !' 
              : 'Attendez que le créateur partage du contenu exclusif'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 relative">
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-full"
        onScrollCapture={handleScroll}
      >
        <div className="px-4 py-6 space-y-6 pb-24">
          {combinedItems.map((item) => {
            if (item.type === 'prono') {
              return (
                <VipPronoCard
                  key={`prono-${item.id}`}
                  totalOdds={item.total_odds}
                  imageUrl={item.image_url}
                  description={item.description}
                  predictionText={item.prediction_text}
                  createdAt={item.created_at}
                  creatorUsername={item.creator_username}
                  onReply={() => onReplyToProno?.(item as VipProno)}
                />
              );
            } else if (item.type === 'debriefing') {
              return (
                <DebriefingCard
                  key={`debriefing-${item.id}`}
                  debriefing={item as Debriefing}
                  isCreator={isCreator}
                  onLike={onLikeDebriefing}
                  onDelete={onDeleteDebriefing}
                />
              );
            } else {
              const messageItem = item as ChannelMessage;
              return (
                <MessageBubble
                  key={item.id}
                  message={messageItem}
                  isCreator={messageItem.user_id === creatorId}
                  creatorId={creatorId}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                  onReply={onReply}
                />
              );
            }
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Bouton scroll vers le bas */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="sm"
          className="fixed bottom-32 right-4 rounded-full w-12 h-12 p-0 shadow-lg z-10"
          variant="default"
        >
          <ArrowDown className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default MessagesList;