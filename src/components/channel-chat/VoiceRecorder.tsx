import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onSendVoice: (audioFile: File) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder = ({ onSendVoice, onCancel, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveformHeights, setWaveformHeights] = useState<number[]>(Array(24).fill(20));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateWaveform = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample 24 values from the frequency data
      const step = Math.floor(dataArray.length / 24);
      const heights = Array(24).fill(0).map((_, i) => {
        const value = dataArray[i * step] || 0;
        return Math.max(15, (value / 255) * 100);
      });
      
      setWaveformHeights(heights);
    }
    
    if (isRecording) {
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [isRecording]);

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
      
      // Set up audio analyser for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
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
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start waveform animation
      animationRef.current = requestAnimationFrame(updateWaveform);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  }, [setIsRecording, updateWaveform]);

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
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsRecording(false);
  }, [setIsRecording]);

  const handleCancel = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
    setWaveformHeights(Array(24).fill(20));
    onCancel();
  }, [stopRecording, onCancel]);

  const handleSend = useCallback(() => {
    // If still recording, stop first then send
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      setIsRecording(false);
      
      // Wait for the blob to be ready
      setTimeout(() => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm'
        });
        
        if (blob.size > 0) {
          const extension = blob.type.includes('webm') ? 'webm' : 'm4a';
          const file = new File([blob], `voice_message_${Date.now()}.${extension}`, {
            type: blob.type
          });
          onSendVoice(file);
        }
        
        setAudioBlob(null);
        setRecordingTime(0);
        setWaveformHeights(Array(24).fill(20));
      }, 100);
      
      return;
    }
    
    // If already stopped and have blob
    if (audioBlob) {
      const extension = audioBlob.type.includes('webm') ? 'webm' : 'm4a';
      const file = new File([audioBlob], `voice_message_${Date.now()}.${extension}`, {
        type: audioBlob.type
      });
      onSendVoice(file);
      setAudioBlob(null);
      setRecordingTime(0);
      setWaveformHeights(Array(24).fill(20));
    }
  }, [audioBlob, isRecording, onSendVoice, setIsRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start recording immediately when component mounts
  useEffect(() => {
    if (!isRecording && !audioBlob) {
      startRecording();
    }
  }, []);

  return (
    <div className="flex items-center space-x-2 p-2 bg-background rounded-full border border-border shadow-sm">
      {/* Cancel/Delete button */}
      <button
        onClick={handleCancel}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording indicator and waveform */}
      <div className="flex-1 flex items-center space-x-3 px-2">
        {/* Recording dot */}
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
          <span className="text-sm font-mono font-medium text-foreground min-w-[45px]">
            {formatTime(recordingTime)}
          </span>
        </div>
        
        {/* Live waveform visualization */}
        <div className="flex-1 flex items-center justify-center space-x-[2px] h-8 overflow-hidden">
          {waveformHeights.map((height, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-primary transition-all duration-75"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Send button - always visible */}
      <button
        onClick={handleSend}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

export default VoiceRecorder;
