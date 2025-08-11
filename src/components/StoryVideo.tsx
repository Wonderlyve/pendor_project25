import React from 'react';
import { useVideoControl } from '@/hooks/useVideoControl';

// Composant pour chaque vidéo individuelle avec son propre contrôle
interface StoryVideoProps {
  story: any;
  isActive: boolean;
  isPaused: boolean;
  onVideoStateChange?: (isPlaying: boolean) => void;
  onVideoEnd?: () => void;
  onVideoReady?: () => void;
}

const StoryVideo: React.FC<StoryVideoProps> = ({
  story,
  isActive,
  isPaused,
  onVideoStateChange,
  onVideoEnd,
  onVideoReady
}) => {
  const { videoRef } = useVideoControl({
    videoId: story.id,
    isActive: isActive && !isPaused,
    autoPlay: true,
    onVideoChange: onVideoStateChange
  });

  return (
    <video 
      ref={videoRef}
      className="w-full h-full object-cover" 
      playsInline
      preload="metadata"
      loop={false}
      src={story.media_url}
      onLoadedData={() => {
        onVideoReady?.();
      }}
      onCanPlay={() => {
        if (isActive && !isPaused) {
          onVideoReady?.();
        }
      }}
      onEnded={isActive ? onVideoEnd : undefined}
      onError={(e) => {
        console.error('Video error:', e);
        console.log('Video URL:', story.media_url);
      }}
      poster={story.media_url + '#t=0.1'}
    />
  );
};

export default StoryVideo;