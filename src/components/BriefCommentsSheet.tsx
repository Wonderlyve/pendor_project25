import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Heart } from 'lucide-react';

interface Comment {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  avatar: string;
}

interface BriefCommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: () => void;
  newComment: string;
  onCommentChange: (value: string) => void;
  title: string;
}

const BriefCommentsSheet = ({
  isOpen,
  onClose,
  comments,
  onAddComment,
  newComment,
  onCommentChange,
  title
}: BriefCommentsSheetProps) => {
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  const handleLikeComment = (commentId: number) => {
    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddComment();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[80vh] p-0">
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle className="text-left">{title}</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full max-h-[calc(80vh-60px)]">
          {/* Comments List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img
                    src={comment.avatar}
                    alt={comment.username}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{comment.message}</p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center space-x-1 text-xs ${
                          likedComments.has(comment.id)
                            ? 'text-red-500'
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            likedComments.has(comment.id) ? 'fill-current' : ''
                          }`}
                        />
                        <span>
                          {likedComments.has(comment.id) ? 'Aimé' : 'J\'aime'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Comment Input */}
          <div className="border-t bg-white p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => onCommentChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={onAddComment}
                disabled={!newComment.trim()}
                size="icon"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BriefCommentsSheet;