import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChannelImageUploadProps {
  onImageUrlChange: (url: string | null) => void;
  currentImageUrl?: string | null;
}

export const ChannelImageUpload = ({ onImageUrlChange, currentImageUrl }: ChannelImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `channel-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('channel-media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('channel-media')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onImageUrlChange(publicUrl);
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image doit faire moins de 5MB');
        return;
      }

      uploadImage(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUrlChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Image du canal</label>
      
      {previewUrl ? (
        <div className="relative">
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Aperçu du canal"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Image className="w-8 h-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p>Cliquez pour ajouter une image</p>
              <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Upload en cours...' : 'Choisir une image'}
      </Button>
    </div>
  );
};