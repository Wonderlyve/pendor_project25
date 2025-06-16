
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import { useAuth } from '@/hooks/useAuth';
import { usePostActions } from '@/hooks/usePostActions';
import { toast } from 'sonner';
import CommentsBottomSheet from '@/components/CommentsBottomSheet';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PredictionCardProps {
  prediction: {
    id: number;
    user: {
      username: string;
      avatar: string;
      badge: string;
      badgeColor: string;
    };
    match: string;
    prediction: string;
    odds: string;
    confidence: number;
    analysis: string;
    likes: number;
    comments: number;
    shares: number;
    successRate: number;
    timeAgo: string;
    sport: string;
    image?: string;
    video?: string;
    is_liked?: boolean;
  };
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const { user } = useAuth();
  const { likePost } = useOptimizedPosts();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(prediction.is_liked || false);
  const [likesCount, setLikesCount] = useState(prediction.likes);
  const [commentsCount, setCommentsCount] = useState(prediction.comments);

  const {
    actionStates,
    loading,
    followUser,
    savePost,
    blockUser,
    sharePost,
    reportPost,
    hidePost,
    deletePost,
    editPost
  } = usePostActions(prediction.id.toString(), prediction.user.username);

  const handleLike = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      await likePost(prediction.id.toString());
    } catch (error) {
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
      toast.error('Erreur lors du like');
    }
  };

  const handleProfileClick = () => {
    navigate(`/profile/${prediction.user.username}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      const success = await deletePost();
      if (success) {
        toast.success('Post supprimé avec succès');
      }
    }
  };

  const handleEdit = () => {
    editPost();
  };

  const canModifyPost = user && user.email === prediction.user.username;
  const canFollowUser = user && user.email !== prediction.user.username;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={prediction.user.avatar}
            alt={prediction.user.username}
            className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 
                className="font-semibold text-gray-900 cursor-pointer hover:text-green-600 transition-colors"
                onClick={handleProfileClick}
              >
                {prediction.user.username}
              </h3>
              <span className={`px-2 py-1 text-xs text-white rounded-full ${prediction.user.badgeColor}`}>
                {prediction.user.badge}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{prediction.timeAgo}</span>
              <span>Succès: {prediction.successRate}%</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canModifyPost && (
              <>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
            {canFollowUser && (
              <DropdownMenuItem 
                onClick={followUser}
                disabled={loading.follow}
              >
                {actionStates.followed ? 'Ne plus suivre' : 'Suivre'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={savePost}
              disabled={loading.save}
            >
              {actionStates.saved ? 'Retirer des favoris' : 'Sauvegarder'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={sharePost}>
              Partager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={reportPost}>
              Signaler
            </DropdownMenuItem>
            <DropdownMenuItem onClick={hidePost}>
              Masquer
            </DropdownMenuItem>
            {canFollowUser && (
              <DropdownMenuItem 
                onClick={blockUser}
                disabled={loading.block}
                className="text-red-600"
              >
                Bloquer l'utilisateur
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sport et Match */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {prediction.sport}
          </span>
          <span className="text-gray-600">{prediction.match}</span>
        </div>
      </div>

      {/* Pronostic */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Pronostic</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cote: {prediction.odds}</span>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Confiance:</span>
              <div className="bg-green-200 rounded-full h-2 w-16">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${prediction.confidence}%` }}
                ></div>
              </div>
              <span className="text-sm text-green-600">{prediction.confidence}%</span>
            </div>
          </div>
        </div>
        <p className="font-medium text-gray-900">{prediction.prediction}</p>
      </div>

      {/* Analyse */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">{prediction.analysis}</p>
      </div>

      {/* Image/Video si présent */}
      {prediction.image && (
        <div className="mb-4">
          <img 
            src={prediction.image} 
            alt="Contenu du post" 
            className="w-full rounded-lg max-h-96 object-cover"
          />
        </div>
      )}

      {prediction.video && (
        <div className="mb-4">
          <video 
            src={prediction.video} 
            controls 
            className="w-full rounded-lg max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </button>

          <CommentsBottomSheet postId={prediction.id.toString()} commentsCount={commentsCount}>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{commentsCount}</span>
            </button>
          </CommentsBottomSheet>

          <button 
            onClick={sharePost}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">{prediction.shares}</span>
          </button>
        </div>

        <button
          onClick={savePost}
          disabled={loading.save}
          className={`transition-colors ${
            actionStates.saved ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${actionStates.saved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default PredictionCard;
