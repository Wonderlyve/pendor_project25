import { useEffect, useRef, useCallback } from 'react';
import { videoControlManager } from '@/optimization/VideoControlManager';

interface UseVideoControlProps {
  videoId: string;
  isActive?: boolean;
  autoPlay?: boolean;
  onVideoChange?: (isPlaying: boolean) => void;
}

export const useVideoControl = ({
  videoId,
  isActive = false,
  autoPlay = false,
  onVideoChange
}: UseVideoControlProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRegisteredRef = useRef(false);

  // Enregistrer la vidéo au montage
  useEffect(() => {
    if (videoRef.current && !isRegisteredRef.current) {
      videoControlManager.registerVideo(videoId, videoRef.current);
      isRegisteredRef.current = true;
      
      // Ajouter les listeners d'événements
      const videoElement = videoRef.current;
      
      const handlePlay = () => {
        onVideoChange?.(true);
      };
      
      const handlePause = () => {
        onVideoChange?.(false);
      };
      
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      
      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
      };
    }
  }, [videoId, onVideoChange]);

  // Gérer l'autoplay quand la vidéo devient active
  useEffect(() => {
    if (isActive && autoPlay && videoRef.current) {
      videoControlManager.playVideo(videoId);
    } else if (!isActive && videoRef.current) {
      // Mettre en pause si pas active
      videoRef.current.pause();
    }
  }, [isActive, autoPlay, videoId]);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (isRegisteredRef.current) {
        videoControlManager.unregisterVideo(videoId);
        isRegisteredRef.current = false;
      }
    };
  }, [videoId]);

  // Fonction pour jouer/pause manuellement
  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      await videoControlManager.playVideo(videoId);
    } else {
      videoRef.current.pause();
    }
  }, [videoId]);

  // Fonction pour jouer la vidéo
  const play = useCallback(async () => {
    await videoControlManager.playVideo(videoId);
  }, [videoId]);

  // Fonction pour mettre en pause
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Vérifier si c'est la vidéo active
  const isActiveVideo = videoControlManager.isVideoActive(videoId);

  return {
    videoRef,
    togglePlay,
    play,
    pause,
    isActiveVideo
  };
};