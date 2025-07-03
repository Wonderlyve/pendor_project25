
import { useState } from 'react';
import { Heart, Reply, Trash2, Send, User } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComments, Comment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommentsBottomSheetProps {
  postId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  commentsCount: number;
}

const CommentItem = ({ 
  comment, 
  onLike, 
  onReply, 
  onDelete, 
  isReply = false 
}: { 
  comment: Comment;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
}) => {
  const { user } = useAuth();
  const isOwner = user && comment.user_id === user.id;

  return (
    <div className={`${isReply ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex items-start space-x-3 p-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          {comment.profiles?.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt={comment.profiles.username || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {comment.profiles?.display_name || comment.profiles?.username || 'Utilisateur'}
            </span>
            {comment.profiles?.badge && (
              <span className={`text-xs px-2 py-1 rounded-full text-white ${
                comment.profiles.badge === 'Pro' ? 'bg-purple-500' : 
                comment.profiles.badge === 'Confirmé' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {comment.profiles.badge}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                comment.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`} />
              <span>{comment.likes_count || 0}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Répondre</span>
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentsBottomSheet = ({ 
  postId, 
  isOpen, 
  onOpenChange, 
  commentsCount 
}: CommentsBottomSheetProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { comments, loading, createComment, likeComment, deleteComment } = useComments(postId);
  const { user } = useAuth();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    console.log('Submitting comment:', { content: newComment, parentId: replyingTo });
    
    const success = await createComment(newComment, replyingTo || undefined);
    if (success) {
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    console.log('Setting reply to:', commentId);
  };

  console.log('CommentsBottomSheet render:', { 
    postId, 
    isOpen, 
    commentsCount, 
    comments: comments.length,
    loading 
  });

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>
            Commentaires ({comments.length})
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun commentaire pour le moment</p>
                <p className="text-sm mt-2">Soyez le premier à commenter !</p>
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onLike={likeComment}
                    onReply={handleReply}
                    onDelete={deleteComment}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Comment input */}
          {user ? (
            <div className="p-4 border-t bg-white">
              {replyingTo && (
                <div className="mb-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Réponse en cours...{' '}
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="text-blue-500 hover:underline"
                  >
                    Annuler
                  </button>
                </div>
              )}
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Écrivez votre commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="self-end bg-green-500 hover:bg-green-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t bg-gray-50 text-center">
              <p className="text-gray-600">Connectez-vous pour commenter</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentsBottomSheet;
