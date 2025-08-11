import { useEffect, useRef, useState, useCallback } from 'react';
import { videoPreloader } from '@/optimization/VideoPreloader';
import { videoCache } from '@/optimization/VideoCache';
import { Loader2, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: string) => void;
  nearbyVideos?: string[]; // Pour le préchargement intelligent
  currentIndex?: number;
}

const OptimizedVideo = ({
  src,
  poster,
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  controls = false,
  preload = 'metadata',
  onLoadStart,
  onCanPlay,
  onError,
  nearbyVideos = [],
  currentIndex = 0
}: OptimizedVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [error, setError] = useState<string | null>(null);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  // Gestion du préchargement intelligent
  useEffect(() => {
    if (nearbyVideos.length > 0) {
      // Précharger les vidéos proches
      videoPreloader.preloadNearbyVideos(currentIndex, nearbyVideos);
    }
  }, [nearbyVideos, currentIndex]);

  // Gestion du cache et du préchargement
  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);
      onLoadStart?.();

      try {
        // Vérifier si la vidéo est déjà préchargée
        const preloadedVideo = videoPreloader.getPreloadedVideo(src);
        if (preloadedVideo) {
          setCachedSrc(src);
          setIsLoading(false);
          onCanPlay?.();
          return;
        }

        // Vérifier le cache
        const cachedUrl = videoCache.getCachedVideo(src);
        if (cachedUrl) {
          setCachedSrc(cachedUrl);
          setIsLoading(false);
          onCanPlay?.();
          return;
        }

        // Charger et mettre en cache la vidéo
        const cacheResult = await videoCache.cacheVideo(src);
        if (cacheResult) {
          setCachedSrc(cacheResult);
        } else {
          setCachedSrc(src); // Fallback à l'URL originale
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(errorMessage);
        onError?.(errorMessage);
        setCachedSrc(src); // Fallback à l'URL originale
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      loadVideo();
    }
  }, [src, onLoadStart, onCanPlay, onError]);

  // Gestion des événements vidéo
  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    onCanPlay?.();
  }, [onCanPlay]);

  const handleError = useCallback(() => {
    setError('Erreur lors du chargement de la vidéo');
    setIsLoading(false);
    onError?.('Erreur lors du chargement de la vidéo');
  }, [onError]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Contrôles personnalisés
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.warn('Échec de la lecture automatique:', err);
      });
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Préchargement des vidéos suivantes au survol
  const handleMouseEnter = useCallback(() => {
    if (nearbyVideos.length > 0 && currentIndex < nearbyVideos.length - 1) {
      const nextVideo = nearbyVideos[currentIndex + 1];
      if (nextVideo) {
        videoPreloader.preloadVideo(nextVideo, 'high');
      }
    }
  }, [nearbyVideos, currentIndex]);

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 z-10">
          <p className="text-white text-sm text-center px-4">
            {error}
          </p>
        </div>
      )}

      {/* Vidéo */}
      <video
        ref={videoRef}
        src={cachedSrc || src}
        poster={poster}
        className={`w-full h-full object-cover ${className}`}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        controls={controls}
        preload={preload}
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* Contrôles personnalisés (si controls est false) */}
      {!controls && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedVideo;