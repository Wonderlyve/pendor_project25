
import { useState } from 'react';
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

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timeAgo: string;
  likes: number;
  replies: Comment[];
}

interface CommentsBottomSheetProps {
  children: React.ReactNode;
  commentsCount: number;
}

const CommentsBottomSheet = ({ children, commentsCount }: CommentsBottomSheetProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const mockComments: Comment[] = [
    {
      id: 1,
      user: {
        name: 'Dizainer Kône',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      content: 'Gaaaaa',
      timeAgo: '1h',
      likes: 0,
      replies: []
    },
    {
      id: 2,
      user: {
        name: 'Karole Tajeute',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3c3?w=100&h=100&fit=crop&crop=face'
      },
      content: 'Moi je ne retourne plus dans cette maison jamais jamais, je suit une fois le gars on part vivre ensemble même by force',
      timeAgo: '1h',
      likes: 4,
      replies: [
        {
          id: 3,
          user: {
            name: 'Elvis Essama',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          },
          content: 'Karole Tajeute pourquoi c\'es...',
          timeAgo: '45min',
          likes: 1,
          replies: []
        }
      ]
    }
  ];

  const handleSendComment = () => {
    if (newComment.trim()) {
      console.log('Sending comment:', newComment);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
      <div className="flex space-x-3">
        <img
          src={comment.user.avatar}
          alt={comment.user.name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <div className="bg-gray-100 rounded-2xl px-3 py-2">
            <p className="font-semibold text-sm text-gray-900">{comment.user.name}</p>
            <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>{comment.timeAgo}</span>
            <button className="hover:text-gray-700">J'aime</button>
            <button 
              className="hover:text-gray-700"
              onClick={() => setReplyingTo(comment.id)}
            >
              Répondre
            </button>
            {comment.likes > 0 && (
              <span className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-red-500 fill-current" />
                <span>{comment.likes}</span>
              </span>
            )}
            <button className="hover:text-gray-700">
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">
            {commentsCount} commentaire{commentsCount !== 1 ? 's' : ''}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Comments List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1">
              {mockComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </ScrollArea>
          
          {/* Comment Input */}
          <div className="border-t bg-white p-4">
            {replyingTo && (
              <div className="mb-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                Réponse à un commentaire...
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
                alt="Your avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 relative">
                <Input
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  className="pr-10 rounded-full border-gray-300"
                />
                <Button
                  size="sm"
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsBottomSheet;
