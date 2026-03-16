import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Trash2, Info } from '@/lib/icons';

const AD_BANNER_STORAGE_KEY = 'modal_ad_banner_url';
const RECOMMENDED_WIDTH = 680;
const RECOMMENDED_HEIGHT = 180;

const AdBannerManager = () => {
  const [bannerUrl, setBannerUrl] = useState('/lovable-uploads/546931fd-e8a2-4958-9150-8ad8c4308659.png');
  const [uploading, setUploading] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => {
    // Load saved banner URL from localStorage (or could use a settings table)
    const saved = localStorage.getItem(AD_BANNER_STORAGE_KEY);
    if (saved) setBannerUrl(saved);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ad-banner-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error('Erreur lors de l\'upload');
        return;
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
      const newUrl = urlData.publicUrl;
      
      setBannerUrl(newUrl);
      localStorage.setItem(AD_BANNER_STORAGE_KEY, newUrl);
      toast.success('Bannière publicitaire mise à jour !');
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSetExternalUrl = () => {
    if (!externalUrl.trim()) return;
    setBannerUrl(externalUrl.trim());
    localStorage.setItem(AD_BANNER_STORAGE_KEY, externalUrl.trim());
    setExternalUrl('');
    toast.success('URL de bannière mise à jour !');
  };

  const handleReset = () => {
    const defaultUrl = '/lovable-uploads/546931fd-e8a2-4958-9150-8ad8c4308659.png';
    setBannerUrl(defaultUrl);
    localStorage.removeItem(AD_BANNER_STORAGE_KEY);
    toast.success('Bannière réinitialisée');
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">🎯 Bannière publicitaire des modals</h3>
      
      {/* Size info */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Taille recommandée de l'image</p>
          <p><strong>{RECOMMENDED_WIDTH} × {RECOMMENDED_HEIGHT} px</strong> (ratio ~3.8:1)</p>
          <p>Format : PNG ou JPG, max 2 Mo</p>
          <p>Cette image apparaît dans les modals de visualisation des pronostics (simples, combinés, loto).</p>
        </div>
      </div>

      {/* Preview */}
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Aperçu actuel</Label>
        <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
          <img 
            src={bannerUrl} 
            alt="Bannière pub" 
            className="w-full h-auto"
            style={{ maxHeight: '120px', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Upload */}
      <div className="space-y-2">
        <Label className="text-sm">Uploader une nouvelle image</Label>
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" className="w-full" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Upload...' : 'Choisir une image'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* External URL */}
      <div className="space-y-2">
        <Label className="text-sm">Ou utiliser une URL externe</Label>
        <div className="flex gap-2">
          <Input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://exemple.com/banniere.png"
            className="flex-1"
          />
          <Button onClick={handleSetExternalUrl} size="sm" disabled={!externalUrl.trim()}>
            Appliquer
          </Button>
        </div>
      </div>

      {/* Reset */}
      <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive">
        <Trash2 className="w-4 h-4 mr-2" />
        Réinitialiser la bannière par défaut
      </Button>
    </Card>
  );
};

export default AdBannerManager;
