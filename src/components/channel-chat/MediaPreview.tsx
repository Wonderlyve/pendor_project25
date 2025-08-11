import { X, File, Image, Video, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaFile {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'file';
}

interface MediaPreviewProps {
  mediaFiles: MediaFile[];
  onRemove: (index: number) => void;
}

const MediaPreview = ({ mediaFiles, onRemove }: MediaPreviewProps) => {
  if (mediaFiles.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-wrap gap-2">
        {mediaFiles.map((media, index) => (
          <div key={index} className="relative group">
            <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
              {media.type === 'image' && media.preview ? (
                <img 
                  src={media.preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : media.type === 'video' && media.preview ? (
                <video 
                  src={media.preview} 
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  {getIcon(media.type)}
                  <span className="text-xs text-gray-500 truncate max-w-12">
                    {media.file.name}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview;