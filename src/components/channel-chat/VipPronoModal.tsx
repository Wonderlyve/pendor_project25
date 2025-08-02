import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface VipPronoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prono: VipPronoData) => void;
}

export interface VipPronoData {
  totalOdds: string;
  image?: File;
  description: string;
  predictionText: string;
}

const VipPronoModal = ({ isOpen, onClose, onSubmit }: VipPronoModalProps) => {
  const [totalOdds, setTotalOdds] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [predictionText, setPredictionText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (!totalOdds || !description || !predictionText) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onSubmit({
      totalOdds,
      image: image || undefined,
      description,
      predictionText
    });

    // Reset form
    setTotalOdds('');
    setImage(null);
    setDescription('');
    setPredictionText('');
    setImagePreview(null);
    onClose();
  };

  const handleClose = () => {
    setTotalOdds('');
    setImage(null);
    setDescription('');
    setPredictionText('');
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un prono VIP</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="totalOdds">Côte totale *</Label>
            <Input
              id="totalOdds"
              type="number"
              step="0.01"
              placeholder="Ex: 2.50"
              value={totalOdds}
              onChange={(e) => setTotalOdds(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Cliquez pour ajouter une image</span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Texte d'accompagnement *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre pronostique..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="predictionText">Détails du pronostique *</Label>
            <Textarea
              id="predictionText"
              placeholder="Détaillez vos prédictions..."
              value={predictionText}
              onChange={(e) => setPredictionText(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Créer le prono VIP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VipPronoModal;