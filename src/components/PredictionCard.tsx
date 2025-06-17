import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trophy, TrendingUp, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePostActions } from '@/hooks/usePostActions';
import { CommentsBottomSheet } from '@/components/CommentsBottomSheet';
import { PredictionModal } from '@/components/PredictionModal';
import { useNavigate } from 'react-router-dom';

interface Match {
  teams: string;
  prediction: string;
  odds?: number;
}

interface PredictionCardProps {
  id: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
    isVerified?: boolean;
  };
  type: 'simple' | 'combined';
  sport?: string;
  matches?: Match[];
  totalOdds?: number;
  stake?: number;
  potentialGain?: number;
  description?: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  timestamp: string;
  status?: 'pending' | 'won' | 'lost';
  isFollowing?: boolean;
  reservationCode?: string;
}

export const PredictionCard = ({ 
  id, 
  user, 
  type, 
  sport,
  matches = [], 
  totalOdds,
  stake,
  potentialGain,
  description, 
  image, 
  video,
  likes, 
  comments, 
  shares, 
  isLiked, 
  isBookmarked, 
  timestamp,
  status = 'pending',
  isFollowing = false,
  reservationCode
}: PredictionCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { 
    likePost, 
    sharePost, 
    savePost, 
    reportPost, 
    blockUser, 
    hidePost,
    followUser,
    loading 
  } = usePostActions();

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${user.username}`);
  };

  const handleLike = async () => {
    await likePost(id);
  };

  const handleShare = async () => {
    await sharePost(id);
  };

  const handleReport = async () => {
    await reportPost(id);
  };

  const handleBlock = async () => {
    await blockUser(user.username);
  };

  const handleHide = async () => {
    await hidePost(id);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'won': return 'Gagné';
      case 'lost': return 'Perdu';
      default: return 'En cours';
    }
  };

  const renderMatches = () => {
    if (type === 'combined' && matches.length > 0) {
      const displayMatches = isExpanded ? matches : matches.slice(0, 2);
      
      return (
        <div className="space-y-2">
          {displayMatches.map((match, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-sm">{match.teams}</p>
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                    {match.prediction}
                  </p>
                </div>
                {match.odds && (
                  <Badge variant="outline" className="ml-2">
                    {match.odds}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          
          {matches.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-blue-600 dark:text-blue-400"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Voir moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Voir {matches.length - 2} match(s) de plus
                </>
              )}
            </Button>
          )}
        </div>
      );
    }

    if (type === 'simple' && matches.length > 0) {
      const match = matches[0];
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="font-medium">{match.teams}</p>
              <p className="text-green-600 dark:text-green-400 font-medium">
                {match.prediction}
              </p>
            </div>
            {match.odds && (
              <Badge variant="outline" className="ml-2">
                {match.odds}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Card className="w-full mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Avatar 
                className="cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={handleUserClick}
              >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span 
                    className="font-semibold cursor-pointer hover:underline" 
                    onClick={handleUserClick}
                  >
                    {user.name}
                  </span>
                  {user.isVerified && <Trophy className="w-4 h-4 text-yellow-500" />}
                  <span className="text-gray-500 text-sm">@{user.username}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-500 text-sm">{timestamp}</span>
                  {sport && <Badge variant="secondary" className="text-xs">{sport}</Badge>}
                  <Badge className={`text-xs text-white ${getStatusColor()}`}>
                    {getStatusText()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleShare}>
                  Partager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport}>
                  Signaler
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBlock}>
                  Bloquer @{user.username}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHide}>
                  Masquer ce post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {description && (
            <p className="text-gray-800 dark:text-gray-200">{description}</p>
          )}

          {renderMatches()}

          {(totalOdds || stake || potentialGain) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                {totalOdds && (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Cote totale</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{totalOdds}</p>
                  </div>
                )}
                {stake && (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Mise</p>
                    <p className="font-bold">{stake}€</p>
                  </div>
                )}
                {potentialGain && (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Gain potentiel</p>
                    <p className="font-bold text-green-600 dark:text-green-400">{potentialGain}€</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {reservationCode && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Code de réservation</p>
              <p className="font-mono font-bold text-lg">{reservationCode}</p>
            </div>
          )}

          {image && (
            <div className="rounded-lg overflow-hidden">
              <img src={image} alt="Prediction" className="w-full h-auto" />
            </div>
          )}

          {video && (
            <div className="rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-auto"
                controls
                playsInline
              >
                <source src={video} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={loading}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(true)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={loading}
                className="flex items-center space-x-1 text-gray-500 hover:text-green-500"
              >
                <Share2 className="w-4 h-4" />
                <span>{shares}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => savePost(id)}
                disabled={loading}
                className={`${isBookmarked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPredictionModal(true)}
                className="text-sm"
              >
                Voir prono
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CommentsBottomSheet
        postId={id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      <PredictionModal
        isOpen={showPredictionModal}
        onClose={() => setShowPredictionModal(false)}
        prediction={{
          id,
          user,
          type,
          sport,
          matches,
          totalOdds,
          stake,
          potentialGain,
          description,
          image,
          video,
          likes,
          comments,
          shares,
          isLiked,
          isBookmarked,
          timestamp,
          status,
          reservationCode
        }}
      />
    </>
  );
};
