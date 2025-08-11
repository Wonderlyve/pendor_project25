import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Play, Pause, Share2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DebriefingCommentsSheet from '@/components/DebriefingCommentsSheet';
import { useDebriefings } from '@/hooks/useDebriefings';
import { useDebriefingViews } from '@/hooks/useDebriefingViews';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';


const BriefPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const { debriefings, likeDebriefing, fetchPublicDebriefings } = useDebriefings(null);
  const { addView } = useDebriefingViews();

  useEffect(() => {
    fetchPublicDebriefings();
  }, []);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Trouver le débriefing actuel
  const briefData = debriefings.find(d => d.id === id);

  // Ajouter une vue quand on commence à regarder la vidéo
  useEffect(() => {
    if (briefData && isPlaying) {
      addView(briefData.id);
    }
  }, [briefData, isPlaying, addView]);

  useEffect(() => {
    if (debriefings.length > 0 && !briefData) {
      navigate('/brief');
      return;
    }
  }, [briefData, navigate, debriefings.length]);

  // Video controls and autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      // Vérifier que la durée est valide (pas NaN, pas Infinity)
      if (videoDuration && isFinite(videoDuration) && videoDuration > 0) {
        setDuration(videoDuration);
      } else {
        setDuration(0);
        console.warn('Durée vidéo invalide:', videoDuration);
      }
      
      // Auto-play the video when metadata is loaded
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log('Autoplay failed:', error);
        // Autoplay failed, user will need to click play
      });
    };

    const handleTimeUpdate = () => {
      const currentVideoTime = video.currentTime;
      // Vérifier que le temps actuel est valide
      if (currentVideoTime && isFinite(currentVideoTime) && currentVideoTime >= 0) {
        setCurrentTime(currentVideoTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
      console.error('Erreur vidéo:', e);
      setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [briefData]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = async () => {
    if (!briefData) return;
    await likeDebriefing(briefData.id);
  };


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Calcul précis de la progression avec vérifications
  const progressPercentage = (duration > 0 && currentTime >= 0 && isFinite(currentTime) && isFinite(duration)) 
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;

  if (!briefData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/brief')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        <div className="aspect-video w-full h-full max-h-screen">
          <video
            ref={videoRef}
            src={briefData.video_url}
            className="w-full h-full object-contain"
            playsInline
            onClick={togglePlay}
          />
          
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="w-20 h-20 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
              >
                <Play className="w-10 h-10 ml-1" />
              </Button>
            </div>
          )}

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center space-x-2 text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 bg-white/30 rounded-full h-1">
                <div
                  className="bg-white rounded-full h-1 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white">
        {/* Video Info */}
        <div className="p-4">
          <h1 className="text-lg font-bold text-gray-900 mb-2">{briefData.title}</h1>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{formatViews(briefData.views)} vues</span>
              <span>•</span>
              <span>{new Date(briefData.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${briefData.isLiked ? 'text-red-500' : 'text-gray-600'}`}
              >
                <Heart className={`w-5 h-5 ${briefData.isLiked ? 'fill-current' : ''}`} />
                <span>{briefData.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-gray-600"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${briefData.creator_id}`}
              alt={briefData.creator_username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{briefData.creator_username}</p>
            </div>
            <Button variant="outline" size="sm">
              S'abonner
            </Button>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed">{briefData.description}</p>
            
            {briefData.post_link && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Publication partagée :</p>
                <a 
                  href={briefData.post_link} 
                  className="text-blue-600 text-sm underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {briefData.post_link}
                </a>
              </div>
            )}
          </div>

          {/* Comments Preview */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900">Commentaires {briefData.comments || 0}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(true)}
                className="text-blue-600"
              >
                Voir tout
              </Button>
            </div>
            
            <div 
              className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2"
              onClick={() => setShowComments(true)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">
                  {briefData.comments > 0 ? 'Voir les commentaires' : 'Soyez le premier à commenter'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Section */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">Publicité</div>
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=60&fit=crop"
              alt="Publicité"
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-900">Améliorez vos pronos</h4>
              <p className="text-xs text-gray-600">Découvrez nos outils d'analyse avancés</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              En savoir plus
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Bottom Sheet */}
      <DebriefingCommentsSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        debriefingId={briefData.id}
        title={`${briefData.comments || 0} commentaires`}
      />
    </div>
  );
};

export default BriefPlayer;