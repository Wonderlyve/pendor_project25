import React from 'react';
import { Heart, Reply, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Comment } from '@/hooks/useComments';
import { useCommentLikes } from '@/hooks/useCommentLikes';

interface CommentItemProps {
  comment: Comment;
  level?: number;
  onReply: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
}

export function CommentItemWithLikes({ comment, level = 0, onReply, onLike, onDelete, currentUserId }: CommentItemProps) {
  const maxLevel = 3; // Maximum nesting level
  const canReply = level < maxLevel;
  const { isLiked, likesCount, toggleLike } = useCommentLikes(comment.id);
  const navigate = useNavigate();

  const handleLike = async () => {
    await toggleLike();
    // Also call the parent onLike for any additional logic
    onLike(comment.id);
  };

  const handleProfileClick = () => {
    if (comment.user_id) {
      navigate(`/profile?userId=${comment.user_id}`);
    }
  };

  return (
    <div className={cn("space-y-2", level > 0 && "ml-6 mt-2 border-l-2 border-border pl-4")}>
      <div className="flex gap-3">
        <Avatar 
          className="h-8 w-8 flex-shrink-0 cursor-pointer hover:opacity-75" 
          onClick={handleProfileClick}
        >
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback>
            {comment.profiles?.display_name?.[0] || comment.profiles?.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="font-medium text-sm truncate cursor-pointer hover:underline"
              onClick={handleProfileClick}
            >
              {comment.profiles?.display_name || comment.profiles?.username || 'Utilisateur'}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
            </span>
            {currentUserId === comment.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <p className="text-sm text-foreground mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-6 px-2 text-xs",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-3 w-3 mr-1", isLiked && "fill-current")} />
              {likesCount}
            </Button>
            
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="h-6 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Répondre
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItemWithLikes
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}