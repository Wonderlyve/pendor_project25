
import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Eye, TrendingUp, Trophy, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import PredictionModal from './PredictionModal';
import CommentsBottomSheet from './CommentsBottomSheet';
import { usePostActions } from '@/hooks/usePostActions';

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
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  const { handleLike, handleShare, handleReport, handleBlock, handleHide } = usePostActions();

  const handleUserClick = () => {
    navigate(`/user/${prediction.user.username}`);
  };

  const onLike = async () => {
    await handleLike(prediction.id.toString());
  };

  const onShare = async () => {
    await handleShare(prediction.id.toString(), prediction.analysis);
  };

  const onReport = async () => {
    await handleReport(prediction.id.toString());
  };

  const onBlock = async () => {
    await handleBlock(prediction.id.toString());
  };

  const onHide = async () => {
    await handleHide(prediction.id.toString());
  };

  const getBadgeStyle = () => {
    switch (prediction.user.badge) {
      case 'Pro':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Confirmé':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expert':
        return 'bg-gold-100 text-gold-800 border-gold-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = () => {
    if (prediction.confidence >= 4) return 'text-green-600';
    if (prediction.confidence >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = () => {
    if (prediction.confidence === 5) return '🚀';
    if (prediction.confidence >= 4) return '🔥';
    if (prediction.confidence >= 3) return '⚡';
    return '💫';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header avec profil utilisateur */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleUserClick}>
            <img
              src={prediction.user.avatar}
              alt={prediction.user.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 text-sm">
                  {prediction.user.username}
                </span>
                <Badge variant="outline" className={`text-xs ${getBadgeStyle()}`}>
                  {prediction.user.badge}
                </Badge>
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{prediction.successRate}% de réussite</span>
                </span>
                <span>{prediction.timeAgo}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onReport}>
                Signaler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBlock}>
                Bloquer l'utilisateur
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHide}>
                Masquer ce post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4 space-y-3">
        {/* Info du match */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-gray-900 text-sm">{prediction.sport}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>20:00</span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{prediction.match}</h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600 font-medium">⚽ {prediction.prediction}</span>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Cote: {prediction.odds}
            </Badge>
          </div>
        </div>

        {/* Niveau de confiance */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Confiance:</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < prediction.confidence ? 'bg-yellow-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-medium ${getConfidenceColor()}`}>
              {prediction.confidence}/5 {getConfidenceIcon()}
            </span>
          </div>
        </div>

        {/* Image ou vidéo si présente */}
        {prediction.image && (
          <img
            src={prediction.image}
            alt="Prédiction"
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        {prediction.video && (
          <video
            src={prediction.video}
            controls
            className="w-full h-48 rounded-lg"
          />
        )}

        {/* Analyse courte */}
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {prediction.analysis}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex items-center space-x-1 ${
              prediction.is_liked ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${prediction.is_liked ? 'fill-current' : ''}`} />
            <span className="text-xs">{prediction.likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(true)}
            className="flex items-center space-x-1 text-gray-500"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{prediction.comments}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="flex items-center space-x-1 text-gray-500"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs">{prediction.shares}</span>
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs">Voir prono</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] p-0">
            <PredictionModal prediction={prediction} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Comments Bottom Sheet */}
      <CommentsBottomSheet
        open={showComments}
        onOpenChange={setShowComments}
        postId={prediction.id.toString()}
      />
    </div>
  );
};

export default PredictionCard;
