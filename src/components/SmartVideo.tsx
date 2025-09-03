import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Loader2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { videoPreloader } from '@/optimization/VideoPreloader';
import { videoCache } from '@/optimization/VideoCache';
import VideoThumbnail from './VideoThumbnail';

interface SmartVideoProps {
  src: string;
  poster?: string;
  isActive: boolean;
  isPaused: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  className?: string;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onLoadedData?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onVideoStateChange?: (isPlaying: boolean) => void;
  onVideoReady?: () => void;
  nearbyVideos?: string[];
  currentIndex?: number;
}

const SmartVideo: React.FC<SmartVideoProps> = ({
  src,
  poster,
  isActive,
  isPaused,
  autoPlay = true,
  muted = true,
  loop = false,
  preload = 'metadata',
  className = '',
  onLoadStart,
  onCanPlay,
  onLoadedData,
  onPlay,
  onPause,
  onEnded,
  onError,
  onVideoStateChange,
  onVideoReady,
  nearbyVideos = [],
  currentIndex = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Préchargement intelligent des vidéos proches
  useEffect(() => {
    if (nearbyVideos.length > 0 && isActive) {
      videoPreloader.preloadNearbyVideos(currentIndex, nearbyVideos);
    }
  }, [nearbyVideos, currentIndex, isActive]);

  // Fonction pour vérifier si c'est un stream HLS
  const isHLS = useCallback((url: string) => {
    return url.includes('.m3u8') || url.includes('hls');
  }, []);

  // Fonction pour nettoyer HLS
  const cleanupHLS = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Configuration et chargement de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const setupVideo = async () => {
      setIsLoading(true);
      setError(null);
      setHasStarted(false);
      onLoadStart?.();

      try {
        // Vérifier le cache d'abord
        const preloadedVideo = videoPreloader.getPreloadedVideo(src);
        if (preloadedVideo) {
          setCachedSrc(src);
          setIsLoading(false);
          return;
        }

        const cachedUrl = videoCache.getCachedVideo(src);
        if (cachedUrl) {
          setCachedSrc(cachedUrl);
          setIsLoading(false);
          return;
        }

        // Configuration HLS si nécessaire
        if (isHLS(src)) {
          if (Hls.isSupported()) {
            cleanupHLS();
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
              maxBufferLength: 10,
              maxMaxBufferLength: 20,
              startLevel: -1, // Auto quality
              manifestLoadingTimeOut: 10000,
              manifestLoadingMaxRetry: 2,
              levelLoadingTimeOut: 10000,
              fragLoadingTimeOut: 20000,
            });

            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              onCanPlay?.();
              onVideoReady?.();
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                const errorMsg = `Erreur HLS: ${data.type} - ${data.details}`;
                setError(errorMsg);
                onError?.(errorMsg);
                setIsLoading(false);
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Support natif HLS (Safari)
            video.src = src;
            setCachedSrc(src);
          } else {
            setError('Format HLS non supporté');
            onError?.('Format HLS non supporté');
            setIsLoading(false);
          }
        } else {
          // Vidéo standard
          try {
            const cacheResult = await videoCache.cacheVideo(src);
            setCachedSrc(cacheResult || src);
          } catch (err) {
            setCachedSrc(src);
          }
          setIsLoading(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
      }
    };

    setupVideo();

    return () => {
      cleanupHLS();
    };
  }, [src, isHLS, onLoadStart, onCanPlay, onError, onVideoReady, cleanupHLS]);

  // Gestion de la lecture/pause basée sur isActive et isPaused
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLoading) return;

    const handlePlayPause = async () => {
      try {
        if (isActive && !isPaused) {
          if (autoPlay && !hasStarted) {
            // Attendre que la vidéo soit vraiment prête
            if (video.readyState >= 3) { // HAVE_FUTURE_DATA
              await video.play();
              setHasStarted(true);
              setShowVideo(true); // Montrer la vidéo seulement quand elle joue
            }
          } else if (hasStarted && video.paused) {
            await video.play();
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      } catch (error) {
        console.warn('Erreur de lecture automatique:', error);
      }
    };

    handlePlayPause();
  }, [isActive, isPaused, hasStarted, autoPlay, isLoading]);

  // Event handlers pour la vidéo
  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    onLoadedData?.();
    // Ne pas montrer la vidéo tout de suite, attendre qu'elle joue
    if (autoPlay && isActive && !isPaused) {
      const video = videoRef.current;
      if (video && video.readyState >= 3) {
        video.play().then(() => {
          setShowVideo(true);
          setHasStarted(true);
          onVideoReady?.();
        }).catch(console.warn);
      }
    } else {
      onVideoReady?.();
    }
  }, [onLoadedData, onVideoReady, autoPlay, isActive, isPaused]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    onCanPlay?.();
    // Essayer de jouer si c'est autoplay et actif
    if (autoPlay && isActive && !isPaused && !hasStarted) {
      const video = videoRef.current;
      if (video) {
        video.play().then(() => {
          setShowVideo(true);
          setHasStarted(true);
          onVideoReady?.();
        }).catch(console.warn);
      }
    } else {
      onVideoReady?.();
    }
  }, [onCanPlay, onVideoReady, autoPlay, isActive, isPaused, hasStarted]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
    onVideoStateChange?.(true);
  }, [onPlay, onVideoStateChange]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
    onVideoStateChange?.(false);
  }, [onPause, onVideoStateChange]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setHasStarted(false);
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const errorMsg = 'Erreur lors du chargement de la vidéo';
    setError(errorMsg);
    setIsLoading(false);
    onError?.(errorMsg);
  }, [onError]);

  // Contrôles manuels
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setHasStarted(true);
      } else {
        video.pause();
      }
    } catch (error) {
      console.warn('Erreur de contrôle manuel:', error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Préchargement au survol
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
      {/* Thumbnail personnalisé ou poster - affiché jusqu'à ce que la vidéo joue */}
      {(isLoading || !showVideo) && (
        <div className="absolute inset-0 z-10 bg-black">
          {customThumbnail ? (
            <img 
              src={customThumbnail}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : poster ? (
            <img 
              src={poster}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <VideoThumbnail
              videoSrc={src}
              className="w-full h-full"
              onThumbnailGenerated={(thumbnailUrl) => {
                setCustomThumbnail(thumbnailUrl);
              }}
            />
          )}
          
          {/* Icône play sur le thumbnail */}
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-white text-sm">Chargement...</span>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 z-20">
          <div className="text-center text-white p-4">
            <p className="text-sm mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs underline"
            >
              Recharger
            </button>
          </div>
        </div>
      )}

      {/* Vidéo */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
        src={!isHLS(src) ? (cachedSrc || src) : undefined}
        muted={isMuted}
        loop={loop}
        preload={preload}
        playsInline
        controls={false}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Contrôles personnalisés (optionnels) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 z-30">
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
    </div>
  );
};

export default SmartVideo;