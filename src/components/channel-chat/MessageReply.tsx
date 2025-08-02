import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageReplyProps {
  replyingTo: {
    id: string;
    username?: string;
    content?: string;
  } | null;
  onCancelReply: () => void;
}

const MessageReply = ({ replyingTo, onCancelReply }: MessageReplyProps) => {
  if (!replyingTo) return null;

  return (
    <div className="bg-gray-100 border-l-4 border-blue-500 p-3 mx-4 mb-2 rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium text-blue-600">
              Réponse à {replyingTo.username || 'Utilisateur'}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {replyingTo.content || 'Message'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancelReply}
          className="ml-2 p-1 h-auto"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default MessageReply;