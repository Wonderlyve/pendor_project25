
import { useState, useEffect } from 'react';
import { Send, Heart, Reply, MoreVertical } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommentsBottomSheetProps {
  children: React.ReactNode;
  postId: string;
  commentsCount: number;
}

const CommentsBottomSheet = ({ children, postId, commentsCount }: CommentsBottomSheetProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actualCommentsCount, setActualCommentsCount] = useState(commentsCount);
  const { comments, loading, createComment, likeComment } = useComments(postId);
  const { user } = useAuth();

  // Mettre à jour le décompte en temps réel
  useEffect(() => {
    const totalComments = comments.reduce((total, comment) => {
      return total + 1 + (comment.replies?.length || 0);
    }, 0);
    setActualCommentsCount(totalComments);
  }, [comments]);

  const handleSendComment = async () => {
    if (newComment.trim() && !submitting) {
      setSubmitting(true);
      try {
        const result = await createComment(newComment, replyingTo || undefined);
        if (result) {
          setNewComment('');
          setReplyingTo(null);
        }
      } catch (error) {
        console.error('Error sending comment:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
      <div className="flex space-x-3">
        <img
          src={comment.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`}
          alt={comment.display_name || comment.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <div className="bg-gray-100 rounded-2xl px-3 py-2">
            <p className="font-semibold text-sm text-gray-900">
              {comment.display_name || comment.username}
              {comment.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {comment.badge}
                </span>
              )}
            </p>
            <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
            <button 
              className={`hover:text-gray-700 ${comment.is_liked ? 'text-red-500' : ''}`}
              onClick={() => likeComment(comment.id)}
              disabled={!user}
            >
              J'aime
            </button>
            <button 
              className="hover:text-gray-700"
              onClick={() => setReplyingTo(comment.id)}
              disabled={!user}
            >
              Répondre
            </button>
            {comment.likes_count > 0 && (
              <span className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-red-500 fill-current" />
                <span>{comment.likes_count}</span>
              </span>
            )}
            <button className="hover:text-gray-700">
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies?.map((reply: any) => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl p-0">
        <SheetHeader className="pb-4 px-6 pt-6">
          <SheetTitle className="text-center">
            {actualCommentsCount} commentaire{actualCommentsCount !== 1 ? 's' : ''}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Comments List */}
          <ScrollArea className="flex-1 px-6">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Chargement des commentaires...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-1 pb-4">
                {comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun commentaire pour le moment</p>
                <p className="text-gray-400 text-sm mt-1">Soyez le premier à commenter !</p>
              </div>
            )}
          </ScrollArea>
          
          {/* Comment Input - Fixed at bottom with 6rem padding */}
          <div className="border-t bg-white px-6 py-4 pb-24">
            {replyingTo && (
              <div className="mb-3 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                Réponse à un commentaire...
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-end space-x-3">
              <img
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt="Your avatar"
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1 relative">
                <Input
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  className="pr-12 rounded-full border-gray-300 min-h-[44px] py-3"
                  disabled={!user || submitting}
                />
                <Button
                  size="sm"
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || !user || submitting}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {!user && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Connectez-vous pour commenter
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsBottomSheet;
