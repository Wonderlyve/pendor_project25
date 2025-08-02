import { Crown, Edit2, Trash2, Check, X } from 'lucide-react';
import { ChannelMessage } from '@/hooks/useChannelMessages';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { EmojiPicker } from './EmojiPicker';
import { ReactionDisplay } from './ReactionDisplay';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MessageBubbleProps {
  message: ChannelMessage;
  isCreator: boolean;
  creatorId?: string;
  onEdit?: (messageId: string, newContent: string) => Promise<boolean>;
  onDelete?: (messageId: string) => Promise<boolean>;
  onReply?: (message: ChannelMessage) => void;
}

const MessageBubble = ({ message, isCreator, creatorId, onEdit, onDelete, onReply }: MessageBubbleProps) => {
  const { user } = useAuth();
  const isFromCreator = message.user_id === creatorId;
  const isOwner = user?.id === message.user_id;
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const messageRef = useRef<HTMLDivElement>(null);
  
  const { groupedReactions, toggleReaction } = useMessageReactions(message.id);
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      setIsEmojiPickerOpen(true);
    }, 500); // 500ms pour l'appui long
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    toggleReaction(emoji);
  };

  const handleReactionClick = (emoji: string) => {
    toggleReaction(emoji);
  };

  const handleEdit = async () => {
    if (!onEdit || !editContent.trim()) return;
    
    const success = await onEdit(message.id, editContent);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      await onDelete(message.id);
    }
  };

  const startEdit = () => {
    setEditContent(message.content || '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditContent(message.content || '');
    setIsEditing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    handleLongPressStart();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    // Permettre le swipe vers la droite pour répondre
    if (diffX > 0 && diffX < 100) {
      setSwipeOffset(diffX);
    }
    
    // Annuler l'appui long si on swipe
    if (Math.abs(diffX) > 10) {
      handleLongPressEnd();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = swipeOffset;
    
    // Si swipe > 50px, déclencher la réponse
    if (diffX > 50 && onReply) {
      onReply(message);
    }
    
    setSwipeOffset(0);
    handleLongPressEnd();
  };

  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <div className={`flex items-start ${isFromCreator ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[75%] ${isFromCreator ? 'text-left' : 'text-right'}`}>
        <div className={`flex items-center space-x-2 mb-1 ${isFromCreator ? 'justify-start' : 'justify-end'}`}>
          {!isFromCreator && (
            <span className="text-xs text-gray-500">
              {formatTime(message.created_at)}
            </span>
          )}
          <span className="font-medium text-sm text-gray-700">
            {message.username}
          </span>
          {isFromCreator && (
            <Crown className="w-3 h-3 text-yellow-500" />
          )}
          {isFromCreator && (
            <span className="text-xs text-gray-500">
              {formatTime(message.created_at)}
            </span>
          )}
        </div>
        
        <div className="relative group">
          <EmojiPicker
            isOpen={isEmojiPickerOpen}
            onClose={() => setIsEmojiPickerOpen(false)}
            onEmojiSelect={handleEmojiSelect}
            trigger={
              <div 
                ref={messageRef}
                className={`rounded-2xl px-4 py-2 shadow-sm cursor-pointer select-none transition-transform ${
                  isFromCreator 
                    ? 'bg-white border border-gray-200 text-gray-900' 
                    : 'bg-blue-500 text-white'
                }`}
                style={{ transform: `translateX(${swipeOffset}px)` }}
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Edition mode */}
                {isEditing && message.content ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleEdit}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
                      >
                        <Check className="w-3 h-3" />
                        <span>Sauvegarder</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg text-xs hover:bg-gray-600"
                      >
                        <X className="w-3 h-3" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Aperçu de réponse */}
                    {message.reply_to_id && (
                      <div className="mb-2 p-2 bg-gray-100 border-l-4 border-blue-400 rounded-r text-xs">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="font-medium text-blue-600">
                            {message.reply_to_username || 'Utilisateur'}
                          </span>
                        </div>
                        <div className="text-gray-600 line-clamp-2">
                          {message.reply_to_media_type && !message.reply_to_content ? (
                            <div className="flex items-center space-x-1">
                              <span>📎</span>
                              <span className="capitalize">{message.reply_to_media_type}</span>
                            </div>
                          ) : (
                            message.reply_to_content || 'Message'
                          )}
                        </div>
                      </div>
                    )}

                    {message.content && (
                      <div className="break-words text-sm leading-relaxed">
                        {message.content}
                      </div>
                    )}
                    
                    {/* Media content */}
                    {message.media_url && (
                      <div className={message.content ? "mt-2" : ""}>
                        {message.media_type === 'image' && (
                          <img 
                            src={message.media_url} 
                            alt={message.media_filename || 'Image'} 
                            className="max-w-full h-auto rounded-lg"
                          />
                        )}
                        {message.media_type === 'video' && (
                          <video 
                            src={message.media_url} 
                            controls 
                            className="max-w-full h-auto rounded-lg"
                            preload="metadata"
                          />
                        )}
                        {message.media_type === 'audio' && (
                          <audio 
                            src={message.media_url} 
                            controls 
                            className="w-full"
                            preload="metadata"
                          />
                        )}
                        {message.media_type === 'file' && (
                          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {message.media_filename || 'Fichier'}
                              </p>
                              <a 
                                href={message.media_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Télécharger
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            }
          />
          
          {/* Boutons d'action - visibles au survol pour le propriétaire */}
          {isOwner && !isEditing && (
            <div className="absolute top-0 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-md p-1 -mt-2 -mr-2">
              {message.content && (
                <button
                  onClick={startEdit}
                  className="p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                  title="Modifier"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        
        <ReactionDisplay 
          groupedReactions={groupedReactions}
          onReactionClick={handleReactionClick}
        />
      </div>
    </div>
  );
};

export default MessageBubble;