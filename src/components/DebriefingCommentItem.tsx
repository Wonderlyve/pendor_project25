import React, { useState } from 'react';
import { Heart, Reply, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DebriefingComment } from '@/hooks/useDebriefingComments';
import { useAuth } from '@/hooks/useAuth';

interface DebriefingCommentItemProps {
  comment: DebriefingComment;
  level?: number;
  onReply?: (commentId: string, username: string) => void;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

const DebriefingCommentItem: React.FC<DebriefingCommentItemProps> = ({
  comment,
  level = 0,
  onReply,
  onLike,
  onDelete
}) => {
  const { user } = useAuth();
  const maxLevel = 2; // Limiter le niveau de nesting

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Maintenant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className={`flex space-x-3 ${level > 0 ? 'ml-8 mt-3' : ''}`}>
      <img
        src={comment.user_avatar}
        alt={comment.user_username}
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-gray-900">
              {comment.user_username}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          
          {user?.id === comment.user_id && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
          {comment.content}
        </p>
        
        <div className="flex items-center space-x-4 mt-2">
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment.id)}
              className={`flex items-center space-x-1 h-6 px-2 ${
                comment.isLiked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{comment.likes}</span>
            </Button>
          )}
          
          {onReply && level < maxLevel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id, comment.user_username || '')}
              className="flex items-center space-x-1 h-6 px-2 text-gray-500"
            >
              <Reply className="w-3 h-3" />
              <span className="text-xs">Répondre</span>
            </Button>
          )}
        </div>
        
        {/* Réponses */}
        {comment.replies && comment.replies.length > 0 && level < maxLevel && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <DebriefingCommentItem
                key={reply.id}
                comment={reply}
                level={level + 1}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebriefingCommentItem;