
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Send, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import CreatePredictionModal from '@/components/CreatePredictionModal';

interface Comment {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

const LiveStream = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(1234);
  const [comment, setComment] = useState('');
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  
  // Mock data pour le live
  const [liveData] = useState({
    id: parseInt(id || '1'),
    streamer: "ProBettor_92",
    title: "PSG vs Real - Analyse en direct 🔥",
    viewers: 1234,
    isLive: true
  });

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      username: "FootballFan",
      message: "Excellent analyse ! 👏",
      timestamp: "Il y a 2min"
    },
    {
      id: 2,
      username: "BetExpert",
      message: "Je pense que le PSG va gagner",
      timestamp: "Il y a 1min"
    },
    {
      id: 3,
      username: "SportLover",
      message: "Quelle cote pour +2.5 buts ?",
      timestamp: "Il y a 30s"
    }
  ]);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const sendComment = () => {
    if (comment.trim()) {
      const newComment: Comment = {
        id: comments.length + 1,
        username: "Vous",
        message: comment,
        timestamp: "Maintenant"
      };
      setComments([...comments, newComment]);
      setComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendComment();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/lives')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">LIVE</span>
            <span className="text-sm">{liveData.viewers.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="mt-2">
          <h1 className="text-lg font-bold text-white">{liveData.title}</h1>
          <p className="text-sm text-white/80">{liveData.streamer}</p>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Video placeholder avec aspect 2:3 */}
        <div className="h-full max-h-screen aspect-[2/3] mx-auto bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
            </div>
            <p className="text-lg font-medium">Vidéo en direct</p>
            <p className="text-sm text-white/70 mt-1">Contenu vidéo sera ici</p>
            <Badge variant="secondary" className="mt-4 bg-orange-500/20 text-orange-200 border-orange-400/30">
              Fonctionnalité en cours de développement
            </Badge>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="absolute right-4 bottom-1/3 flex flex-col space-y-4">
          <div className="text-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`w-12 h-12 rounded-full ${liked ? 'bg-red-500 text-white' : 'bg-black/30 text-white'} hover:bg-red-500/80`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </Button>
            <p className="text-white text-xs mt-1">{likes}</p>
          </div>
          
          <div className="text-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/30 text-white hover:bg-white/20"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <p className="text-white text-xs mt-1">{comments.length}</p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-t-3xl p-4 max-h-64 flex flex-col">
        <div className="flex items-center space-x-2 mb-3">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Commentaires en direct</span>
        </div>
        
        <ScrollArea className="flex-1 mb-3">
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {comment.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-900">{comment.username}</span>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Écrire un commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={sendComment} size="icon" className="bg-blue-500 hover:bg-blue-600">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="bg-white border-t border-gray-200 p-4 flex space-x-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {/* Logic pour voir les pronos live */}}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Voir les pronos Live
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          onClick={() => setShowPredictionModal(true)}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Publier un prono Live
        </Button>
      </div>

      <CreatePredictionModal 
        open={showPredictionModal} 
        onOpenChange={setShowPredictionModal} 
      />
    </div>
  );
};

export default LiveStream;
