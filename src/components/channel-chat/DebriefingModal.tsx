
import { useState } from 'react';
import { X, Upload, Video, Image, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface DebriefingData {
  title: string;
  description: string;
  video?: File;
  thumbnail?: File;
  postLink?: string;
}

interface DebriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DebriefingData) => void;
}

const DebriefingModal = ({ isOpen, onClose, onSubmit }: DebriefingModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [postLink, setPostLink] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (!description.trim()) {
      toast.error('La description est requise');
      return;
    }

    // Additional validation for title length
    if (title.trim().length > 200) {
      toast.error('Le titre ne peut pas dépasser 200 caractères');
      return;
    }

    // Additional validation for description length
    if (description.trim().length > 1000) {
      toast.error('La description ne peut pas dépasser 1000 caractères');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      video: video || undefined,
      thumbnail: thumbnail || undefined,
      postLink: postLink.trim() || undefined
    });

    // Reset form
    setTitle('');
    setDescription('');
    setVideo(null);
    setThumbnail(null);
    setPostLink('');
  };

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('La vidéo ne doit pas dépasser 50MB');
      return;
    }

    // Validate horizontal format
    try {
      const isHorizontal = await validateVideoFormat(file);
      if (!isHorizontal) {
        toast.error('Seules les vidéos au format horizontal (paysage) sont acceptées pour les briefs');
        return;
      }
      
      setVideo(file);
      toast.success('Vidéo sélectionnée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la validation de la vidéo');
    }
  };

  const validateVideoFormat = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Check if width > height for horizontal format
        const isHorizontal = video.videoWidth > video.videoHeight;
        URL.revokeObjectURL(video.src);
        resolve(isHorizontal);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(false);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleThumbnailUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setThumbnail(file);
    toast.success('Image d\'aperçu sélectionnée');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleVideoUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-primary" />
            <span>Créer un débriefing</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div>
              <Label htmlFor="title">Titre du débriefing</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entrez le titre..."
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre débriefing..."
                className="min-h-[100px] mt-1"
                required
              />
            </div>

            <div>
              <Label>Vidéo (format paysage recommandé)</Label>
              <div
                className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('video-input')?.click()}
              >
                {video ? (
                  <div className="space-y-2">
                    <Video className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Vidéo sélectionnée: {video.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Taille: {(video.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideo(null);
                      }}
                    >
                      Changer la vidéo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Glissez-déposez une vidéo ou cliquez ici
                    </p>
                    <p className="text-xs text-gray-500">
                      Formats supportés: MP4, WebM, MOV (max 50MB)
                    </p>
                  </div>
                )}
                <input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>

            {/* Image d'aperçu */}
            <div>
              <Label htmlFor="thumbnail">Image d'aperçu (optionnel)</Label>
              <div className="mt-1">
                {thumbnail ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(thumbnail)}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setThumbnail(null)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Sélectionner une image d'aperçu</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailUpload(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Lien vers un post */}
            <div>
              <Label htmlFor="postLink">Lien vers un post (optionnel)</Label>
              <div className="relative mt-1">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="postLink"
                  type="url"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  placeholder="https://example.com/post"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Publier le débriefing
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebriefingModal;
