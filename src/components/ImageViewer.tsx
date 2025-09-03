import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

const ImageViewer = ({ isOpen, onClose, imageUrl, altText = "Image" }: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un élément <a> invisible pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire le nom du fichier de l'URL ou utiliser un nom par défaut
      const fileName = imageUrl.split('/').pop() || 'image.jpg';
      link.download = fileName;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL temporaire
      window.URL.revokeObjectURL(url);
      
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Bouton fermer */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
          
          {/* Bouton télécharger */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="w-6 h-6" />
          </Button>
          
          {/* Image */}
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;