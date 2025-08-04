import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Upload, Video } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    image_url?: string;
    video_url?: string;
  };
  onSave: (postId: string, imageFile?: File, videoFile?: File) => Promise<void>;
}

const EditPostModal = ({ isOpen, onClose, post, onSave }: EditPostModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.image_url || null);
  const [videoPreview, setVideoPreview] = useState<string | null>(post.video_url || null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('L\'image ne doit pas dépasser 10MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('La vidéo ne doit pas dépasser 100MB');
        return;
      }
      
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(post.id, selectedImage || undefined, selectedVideo || undefined);
      toast.success('Post modifié avec succès !');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la modification du post');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = selectedImage !== null || selectedVideo !== null || 
                    (imagePreview !== post.image_url) || 
                    (videoPreview !== post.video_url);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Modifier le post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Ajouter une image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
            {!imagePreview && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>

          {/* Video Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Vidéo</label>
            {videoPreview ? (
              <div className="relative">
                <video 
                  src={videoPreview} 
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
                <button
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Video className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Ajouter une vidéo</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </label>
            )}
            {!videoPreview && (
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={loading || !hasChanges}
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;