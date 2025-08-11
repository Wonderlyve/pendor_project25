import { useEffect, useRef } from 'react';
import { videoPreloader } from '@/optimization/VideoPreloader';
import { videoCache } from '@/optimization/VideoCache';
import { videoPrefetcher } from '@/optimization/VideoPrefetcher';

interface UseVideoOptimizationProps {
  videos: string[];
  currentIndex?: number;
  autoPreload?: boolean;
  enablePrefetch?: boolean;
}

export const useVideoOptimization = ({
  videos,
  currentIndex = 0,
  autoPreload = true,
  enablePrefetch = true
}: UseVideoOptimizationProps) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      // Initialiser le système de prefetch intelligent une seule fois
      if (enablePrefetch) {
        videoPrefetcher.setupIntelligentPrefetch();
        videoPrefetcher.setupPageSpecificRules();
      }
      initializedRef.current = true;
    }

    // Précharger les vidéos proches de la vidéo actuelle
    if (autoPreload && videos.length > 0) {
      videoPreloader.preloadNearbyVideos(currentIndex, videos);
    }

    return () => {
      // Nettoyage si nécessaire
    };
  }, [videos, currentIndex, autoPreload, enablePrefetch]);

  // Précharger une liste de vidéos avec priorité
  const preloadVideos = (urls: string[], priority: 'high' | 'medium' | 'low' = 'medium') => {
    urls.forEach(url => videoPreloader.preloadVideo(url, priority));
  };

  // Mettre en cache une vidéo
  const cacheVideo = async (url: string) => {
    return await videoCache.cacheVideo(url);
  };

  // Obtenir les statistiques du cache
  const getCacheStats = () => {
    return videoCache.getCacheStats();
  };

  // Nettoyer le cache
  const clearCache = () => {
    videoCache.clearCache();
    videoPreloader.clearCache();
  };

  return {
    preloadVideos,
    cacheVideo,
    getCacheStats,
    clearCache
  };
};