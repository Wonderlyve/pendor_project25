import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Send, X, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onSendVoice: (audioFile: File) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder = ({ onSendVoice, onCancel, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  }, [setIsRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setIsPaused(false);
  }, [setIsRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  }, []);

  const handleCancel = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    onCancel();
  }, [stopRecording, onCancel]);

  const handleSend = useCallback(() => {
    if (audioBlob) {
      const extension = audioBlob.type.includes('webm') ? 'webm' : 'm4a';
      const file = new File([audioBlob], `voice_message_${Date.now()}.${extension}`, {
        type: audioBlob.type
      });
      onSendVoice(file);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    }
  }, [audioBlob, onSendVoice]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Start recording immediately when component mounts
  useEffect(() => {
    if (!isRecording && !audioBlob) {
      startRecording();
    }
  }, []);

  return (
    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      {/* Cancel button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Recording indicator / Audio preview */}
      <div className="flex-1 flex items-center space-x-3">
        {isRecording ? (
          <>
            {/* Recording animation */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-sm font-medium text-foreground">
                {isPaused ? 'En pause' : 'Enregistrement...'}
              </span>
            </div>
            
            {/* Timer */}
            <span className="text-sm font-mono text-muted-foreground">
              {formatTime(recordingTime)}
            </span>
            
            {/* Waveform animation */}
            {!isPaused && (
              <div className="flex items-center space-x-0.5 h-6">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.5s'
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : audioBlob ? (
          <>
            {/* Audio preview */}
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Message vocal
              </span>
              <span className="text-sm text-muted-foreground">
                {formatTime(recordingTime)}
              </span>
            </div>
            
            {/* Mini audio player */}
            {audioUrl && (
              <audio 
                src={audioUrl} 
                controls 
                className="h-8 max-w-[120px]"
              />
            )}
          </>
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        {isRecording ? (
          <>
            {/* Pause/Resume button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="rounded-full h-10 w-10 hover:bg-primary/10"
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-primary" />
              ) : (
                <Pause className="w-5 h-5 text-primary" />
              )}
            </Button>
            
            {/* Stop button */}
            <Button
              variant="default"
              size="icon"
              onClick={stopRecording}
              className="rounded-full h-10 w-10 bg-red-500 hover:bg-red-600"
            >
              <Square className="w-4 h-4" />
            </Button>
          </>
        ) : audioBlob ? (
          /* Send button */
          <Button
            variant="default"
            size="icon"
            onClick={handleSend}
            className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default VoiceRecorder;
