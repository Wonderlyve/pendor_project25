import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioWaveformProps {
  audioUrl: string;
  duration?: number;
  isFromCreator?: boolean;
}

const AudioWaveform = ({ audioUrl, duration, isFromCreator = false }: AudioWaveformProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Generate random but consistent waveform bars
  const bars = Array.from({ length: 28 }, (_, i) => {
    // Use a seeded random based on index for consistency
    const seed = (i * 13 + 7) % 100;
    const height = 20 + (seed % 60);
    return height;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * audioDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex items-center space-x-3 min-w-[200px] max-w-[280px]">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isFromCreator
            ? 'bg-primary/20 hover:bg-primary/30 text-primary'
            : 'bg-white/20 hover:bg-white/30 text-white'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Waveform visualization */}
      <div className="flex-1 flex flex-col space-y-1">
        <div
          ref={progressRef}
          className="flex items-center space-x-[2px] h-8 cursor-pointer"
          onClick={handleProgressClick}
        >
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isActive = barProgress <= progress;
            
            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all duration-150 ${
                  isFromCreator
                    ? isActive ? 'bg-primary' : 'bg-primary/30'
                    : isActive ? 'bg-white' : 'bg-white/40'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className={`text-xs ${isFromCreator ? 'text-muted-foreground' : 'text-white/70'}`}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>
      </div>
    </div>
  );
};

export default AudioWaveform;
