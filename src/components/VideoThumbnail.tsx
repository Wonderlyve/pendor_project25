import React, { useRef, useEffect, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface VideoThumbnailProps {
  videoSrc: string;
  className?: string;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoSrc,
  className = '',
  onThumbnailGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!videoSrc) return;

    // Vérifier d'abord le cache localStorage
    const cacheKey = `thumbnail_${btoa(videoSrc).slice(0, 20)}`;
    const cachedThumbnail = localStorage.getItem(cacheKey);
    
    if (cachedThumbnail) {
      setThumbnailUrl(cachedThumbnail);
      onThumbnailGenerated?.(cachedThumbnail);
      return;
    }

    // Générer le thumbnail
    generateThumbnail();
  }, [videoSrc]);

  const generateThumbnail = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    setIsGenerating(true);

    try {
      // Configuration de la vidéo pour capture
      video.crossOrigin = 'anonymous';
      video.currentTime = 1; // Capture à 1 seconde
      video.muted = true;
      video.preload = 'metadata';
      
      const handleLoadedData = () => {
        try {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Définir les dimensions du canvas
          canvas.width = video.videoWidth || 720;
          canvas.height = video.videoHeight || 1280;

          // Dessiner le frame vidéo
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convertir en blob et créer URL
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setThumbnailUrl(url);
              onThumbnailGenerated?.(url);

              // Sauvegarder en cache (convertir en base64 pour localStorage)
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  const cacheKey = `thumbnail_${btoa(videoSrc).slice(0, 20)}`;
                  try {
                    localStorage.setItem(cacheKey, reader.result);
                  } catch (e) {
                    // Cache plein, ignorer
                    console.warn('Cache thumbnail plein');
                  }
                }
              };
              reader.readAsDataURL(blob);
            }
            setIsGenerating(false);
          }, 'image/jpeg', 0.8);

        } catch (error) {
          console.warn('Erreur génération thumbnail:', error);
          setIsGenerating(false);
        }
      };

      const handleError = () => {
        console.warn('Erreur chargement vidéo pour thumbnail');
        setIsGenerating(false);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      video.addEventListener('seeked', handleLoadedData);
      
      video.src = videoSrc;
      video.load();

      // Cleanup
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.removeEventListener('seeked', handleLoadedData);
      };

    } catch (error) {
      console.warn('Erreur génération thumbnail:', error);
      setIsGenerating(false);
    }
  };

  if (!thumbnailUrl && !isGenerating) {
    return (
      <div className={`bg-gradient-to-br from-purple-900 via-pink-800 to-orange-600 flex items-center justify-center ${className}`}>
        <Play className="w-16 h-16 text-white/70" />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <>
      <img
        src={thumbnailUrl || undefined}
        alt="Video thumbnail"
        className={`object-cover ${className}`}
        loading="eager"
      />
      {/* Éléments cachés pour génération */}
      <video
        ref={videoRef}
        className="hidden"
        muted
        preload="metadata"
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </>
  );
};

export default VideoThumbnail;