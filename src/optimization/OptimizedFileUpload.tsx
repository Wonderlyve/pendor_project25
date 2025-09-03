
import { useRef, useState } from 'react';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImageOptimizer } from './ImageOptimizer';
import { VideoOptimizer } from './VideoOptimizer';
import { toast } from 'sonner';

interface OptimizedFileUploadProps {
  onImageSelect: (file: File | null, thumbnail?: string) => void;
  onVideoSelect: (file: File | null, thumbnail?: string) => void;
  selectedImage: File | null;
  selectedVideo: File | null;
}

const OptimizedFileUpload = ({ onImageSelect, onVideoSelect, selectedImage, selectedVideo }: OptimizedFileUploadProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation basique
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulation du progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Génération du thumbnail
      const thumbnail = await ImageOptimizer.generateThumbnail(file);
      
      // Compression de l'image
      const optimizedFile = await ImageOptimizer.compressImage(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      onImageSelect(optimizedFile, thumbnail);
      toast.success('Image optimisée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      toast.error('Erreur lors de l\'optimisation de l\'image');
      onImageSelect(file); // Fallback au fichier original
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo valide');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Validation de la vidéo
      const isValid = await VideoOptimizer.validateVideo(file, {
        maxSize: 50, // 50MB
        maxDuration: 300, // 5 minutes
        quality: 'medium'
      });

      if (!isValid) {
        toast.error('La vidéo dépasse les limites autorisées (50MB, 5min)');
        return;
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // Génération du thumbnail
      const thumbnail = await VideoOptimizer.generateVideoThumbnail(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      onVideoSelect(file, thumbnail);
      toast.success('Vidéo traitée avec succès !');
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast.error('Erreur lors du traitement de la vidéo');
      onVideoSelect(file); // Fallback au fichier original
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const removeImage = () => {
    onImageSelect(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeVideo = () => {
    onVideoSelect(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs"
          onClick={() => imageInputRef.current?.click()}
          disabled={processing}
        >
          {processing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Image className="w-4 h-4 mr-1" />}
          Photo
        </Button>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs"
          onClick={() => videoInputRef.current?.click()}
          disabled={processing}
        >
          {processing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Video className="w-4 h-4 mr-1" />}
          Vidéo
        </Button>
      </div>

      {/* Progress bar */}
      {processing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-gray-500 text-center">
            Optimisation en cours... {progress}%
          </p>
        </div>
      )}

      {/* Preview de l'image sélectionnée */}
      {selectedImage && (
        <div className="relative">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {selectedImage.name}
          </div>
        </div>
      )}

      {/* Preview de la vidéo sélectionnée */}
      {selectedVideo && (
        <div className="relative">
          <video
            src={URL.createObjectURL(selectedVideo)}
            className="w-full h-32 object-cover rounded-lg"
            controls
          />
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {selectedVideo.name}
          </div>
        </div>
      )}

      {/* Inputs cachés */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
      />
    </div>
  );
};

export default OptimizedFileUpload;
