import { useState, useRef } from 'react';
import { Send, Paperclip, Image, Video, Music, Smile, Mic } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MediaPreview from './MediaPreview';
import VoiceRecorder from './VoiceRecorder';

interface MediaFile {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'file';
}

interface MediaInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: (mediaFiles?: File[]) => void;
  disabled?: boolean;
}

const MediaInput = ({ newMessage, setNewMessage, onSendMessage, disabled }: MediaInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const filesToSend = mediaFiles.map(media => media.file);
    onSendMessage(filesToSend.length > 0 ? filesToSend : undefined);
    setMediaFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType?: string) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate file size (max 50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`Le fichier "${file.name}" est trop volumineux (max 50MB)`);
        return;
      }
    }
    
    files.forEach(file => {
      const type = getFileType(file, fileType);
      const mediaFile: MediaFile = { file, type };
      
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            mediaFile.preview = e.target.result as string;
            setMediaFiles(prev => [...prev, mediaFile]);
          }
        };
        reader.onerror = () => {
          toast.error('Erreur lors de la lecture du fichier image');
        };
        reader.readAsDataURL(file);
      } else {
        setMediaFiles(prev => [...prev, mediaFile]);
      }
    });
    
    setShowMediaMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (file: File, forcedType?: string): 'image' | 'video' | 'audio' | 'file' => {
    if (forcedType) return forcedType as any;
    
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'];

  const addEmoji = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendVoice = (audioFile: File) => {
    onSendMessage([audioFile]);
    setShowVoiceRecorder(false);
    setIsRecording(false);
  };

  const handleCancelVoice = () => {
    setShowVoiceRecorder(false);
    setIsRecording(false);
  };

  // Show voice recorder UI
  if (showVoiceRecorder) {
    return (
      <div className="bg-background border-t border-border p-4">
        <VoiceRecorder
          onSendVoice={handleSendVoice}
          onCancel={handleCancelVoice}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />
      </div>
    );
  }

  return (
    <>
      <MediaPreview mediaFiles={mediaFiles} onRemove={removeMediaFile} />
      
      <div className="bg-background border-t border-border p-4">
        <div className="flex items-end space-x-3">
          {/* Media attachment button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMediaMenu(!showMediaMenu)}
              className="rounded-full hover:bg-accent"
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            {showMediaMenu && (
              <div className="absolute bottom-12 left-0 bg-popover border border-border rounded-lg shadow-lg p-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e) => handleFileSelect(e as any, 'image');
                    input.click();
                  }}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.multiple = true;
                    input.onchange = (e) => handleFileSelect(e as any, 'video');
                    input.click();
                  }}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Vidéo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'audio/*';
                    input.multiple = true;
                    input.onchange = (e) => handleFileSelect(e as any, 'audio');
                    input.click();
                  }}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Audio
                </Button>
              </div>
            )}
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Input
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              className="rounded-full border-border focus:border-primary pr-20"
            />
            
            {/* Emoji and voice buttons */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-6 w-6 p-0 rounded-full hover:bg-accent"
              >
                <Smile className="w-4 h-4 text-muted-foreground" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full hover:bg-accent"
                onClick={() => setShowVoiceRecorder(true)}
                disabled={disabled}
              >
                <Mic className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={disabled || (!newMessage.trim() && mediaFiles.length === 0)}
            className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="mt-3 bg-muted border border-border rounded-lg p-3 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="text-lg hover:bg-accent rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={handleFileSelect}
      />
    </>
  );
};

export default MediaInput;