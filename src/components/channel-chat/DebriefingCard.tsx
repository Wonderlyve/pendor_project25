import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Heart, MoreVertical, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useDebriefingViews } from '@/hooks/useDebriefingViews';

export interface Debriefing {
  id: string;
  title: string;
  description: string;
  video_url: string;
  creator_id: string;
  creator_username: string;
  likes: number;
  views: number;
  isLiked: boolean;
  created_at: string;
}

interface DebriefingCardProps {
  debriefing: Debriefing;
  isCreator?: boolean;
  onLike: (debriefingId: string) => void;
  onDelete?: (debriefingId: string) => void;
}

const DebriefingCard = ({ debriefing, isCreator, onLike, onDelete }: DebriefingCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasViewBeenAdded, setHasViewBeenAdded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addView } = useDebriefingViews();

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
    };

    const handleTimeUpdate = () => {
      const currentVideoTime = video.currentTime;
      // Vérifier que le temps actuel est valide
      if (currentVideoTime && isFinite(currentVideoTime) && currentVideoTime >= 0) {
        setCurrentTime(currentVideoTime);
      }
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
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
      // Add view when video starts playing (only once per session)
      if (!hasViewBeenAdded) {
        const viewAdded = await addView(debriefing.id);
        if (viewAdded) {
          setHasViewBeenAdded(true);
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    onLike(debriefing.id);
    toast.success(debriefing.isLiked ? 'Like retiré' : 'Débriefing liké !');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(debriefing.id);
      toast.success('Débriefing supprimé');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcul précis de la progression avec vérifications
  const progressPercentage = (duration > 0 && currentTime >= 0 && isFinite(currentTime) && isFinite(duration)) 
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${debriefing.creator_id}`}
              alt={debriefing.creator_username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {debriefing.creator_username}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(debriefing.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-1">
                {debriefing.title}
              </h3>
            </div>
          </div>
          
          {isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <p className="text-gray-700 mt-2">{debriefing.description}</p>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={debriefing.video_url}
          className="w-full h-full object-cover"
          playsInline
          preload="metadata"
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="w-16 h-16 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
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

      {/* Actions */}
      <div className="p-4 pt-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              debriefing.isLiked ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${debriefing.isLiked ? 'fill-current' : ''}`} />
            <span>{debriefing.likes}</span>
          </Button>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Eye className="w-5 h-5" />
            <span>{debriefing.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebriefingCard;