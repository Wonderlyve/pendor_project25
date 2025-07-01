
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, BookmarkPlus, MoreHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import CommentsBottomSheet from './CommentsBottomSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LazyImage from '@/optimization/LazyImage';

interface User {
  username: string;
  avatar: string;
  badge: string;
  badgeColor: string;
}

interface Prediction {
  id: number;
  user: User;
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
}

interface PredictionCardProps {
  prediction: Prediction;
  onOpenModal?: (data: any) => void;
}

const PredictionCard = ({ prediction, onOpenModal }: PredictionCardProps) => {
  const [isLiked, setIsLiked] = useState(prediction.is_liked || false);
  const [likesCount, setLikesCount] = useState(prediction.likes);
  const [showComments, setShowComments] = useState(false);
  const { likePost } = useOptimizedPosts();
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    try {
      // Conversion sécurisée de l'ID en string
      const postId = prediction.id.toString();
      console.log('Liking post with ID:', postId);
      
      await likePost(postId);
      
      // Mise à jour optimiste de l'UI
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Erreur lors du like');
    }
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Pronostic de ${prediction.user.username}`,
        text: prediction.prediction,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  const handleSave = () => {
    toast.success('Pronostic sauvegardé !');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Très confiant';
    if (confidence >= 60) return 'Confiant';
    return 'Peu confiant';
  };

  return (
    <>
      <Card className="w-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Header avec utilisateur */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={prediction.user.avatar} alt={prediction.user.username} />
                <AvatarFallback>{prediction.user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{prediction.user.username}</span>
                  <Badge className={`${prediction.user.badgeColor} text-white text-xs`}>
                    {prediction.user.badge}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{prediction.sport}</span>
                  <span>•</span>
                  <span>{prediction.timeAgo}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{prediction.successRate}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSave}>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Sauvegarder
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Masquer ce post
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Signaler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Match et pronostic */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{prediction.match}</h3>
            <p className="text-blue-600 font-semibold">{prediction.prediction}</p>
          </div>

          {/* Cotes et confiance */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-green-50 px-3 py-1 rounded-full">
              <span className="text-green-700 font-semibold">Cote: {prediction.odds}</span>
            </div>
            <div className={`flex items-center space-x-1 ${getConfidenceColor(prediction.confidence)}`}>
              <span className="font-medium">{prediction.confidence}%</span>
              <span className="text-sm">({getConfidenceLabel(prediction.confidence)})</span>
            </div>
          </div>

          {/* Image si présente */}
          {prediction.image && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <LazyImage
                src={prediction.image}
                alt="Image du pronostic"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Analyse */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">{prediction.analysis}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleComment}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{prediction.comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
              >
                <Share2 className="h-5 w-5" />
                <span>{prediction.shares}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Sheet pour les commentaires */}
      <CommentsBottomSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={prediction.id.toString()}
        postTitle={prediction.match}
      />
    </>
  );
};

export default PredictionCard;
