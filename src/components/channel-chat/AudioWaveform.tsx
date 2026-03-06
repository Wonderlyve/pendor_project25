import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioWaveformProps {
  audioUrl: string;
  duration?: number;
  isFromCreator?: boolean;
}

const BAR_COUNT = 40;

const AudioWaveform = ({ audioUrl, duration, isFromCreator = false }: AudioWaveformProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [frequencyBars, setFrequencyBars] = useState<number[]>(Array(BAR_COUNT).fill(8));
  const [playbackRate, setPlaybackRate] = useState(1);
  const SPEEDS = [1, 1.5, 2];
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;
    
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;
    
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  const updateFrequencyBars = useCallback(() => {
    if (!analyserRef.current || !isPlaying) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Map frequency bins to our bar count
    const step = Math.floor(dataArray.length / BAR_COUNT);
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
      // Average nearby bins for smoother visualization
      const startIdx = i * step;
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[startIdx + j] || 0;
      }
      const avg = sum / step;
      // Map 0-255 to 8-100% height
      return Math.max(8, (avg / 255) * 100);
    });
    
    setFrequencyBars(bars);
    animationRef.current = requestAnimationFrame(updateFrequencyBars);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    initAudioContext();
    
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateFrequencyBars);
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
    setFrequencyBars(Array(BAR_COUNT).fill(8));
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
      if (audioRef.current) audioRef.current.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Keep animation loop in sync with isPlaying
  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      animationRef.current = requestAnimationFrame(updateFrequencyBars);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, updateFrequencyBars]);

  return (
    <div className="flex items-center space-x-3 min-w-[220px] max-w-[300px]">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
        crossOrigin="anonymous"
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
          className="flex items-center space-x-[1.5px] h-9 cursor-pointer"
          onClick={handleProgressClick}
        >
          {frequencyBars.map((height, i) => {
            const barProgress = (i / BAR_COUNT) * 100;
            const isActive = barProgress <= progress;
            
            return (
              <div
                key={i}
                className={`w-[2.5px] rounded-full transition-all duration-75 ${
                  isFromCreator
                    ? isActive ? 'bg-primary' : 'bg-primary/25'
                    : isActive ? 'bg-white' : 'bg-white/35'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Time + Speed */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-mono ${isFromCreator ? 'text-muted-foreground' : 'text-white/70'}`}>
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
          <button
            onClick={() => {
              const nextIdx = (SPEEDS.indexOf(playbackRate) + 1) % SPEEDS.length;
              const newRate = SPEEDS[nextIdx];
              setPlaybackRate(newRate);
              if (audioRef.current) audioRef.current.playbackRate = newRate;
            }}
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
              isFromCreator
                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            x{playbackRate}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioWaveform;
