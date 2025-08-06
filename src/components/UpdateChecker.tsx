import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, X } from 'lucide-react';

interface AppVersion {
  id: string;
  version_name: string;
  version_code: number;
  apk_url: string;
  release_notes: string;
  is_active: boolean;
  created_at: string;
}

const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // Version actuelle de l'app (à stocker dans localStorage ou constante)
  const CURRENT_VERSION_CODE = 1;

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      const { data: activeVersion, error } = await supabase
        .from('app_versions')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error || !activeVersion) return;

      // Vérifier si une nouvelle version est disponible
      if (activeVersion.version_code > CURRENT_VERSION_CODE) {
        setLatestVersion(activeVersion);
        setUpdateAvailable(true);
        
        // Vérifier si l'utilisateur a déjà refusé cette version
        const dismissedVersion = localStorage.getItem('dismissed_version');
        if (dismissedVersion !== activeVersion.version_code.toString()) {
          setShowUpdateDialog(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des mises à jour:', error);
    }
  };

  const handleDownload = () => {
    if (latestVersion?.apk_url) {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = latestVersion.apk_url;
      link.download = `app-${latestVersion.version_name}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowUpdateDialog(false);
    }
  };

  const handleDismiss = () => {
    if (latestVersion) {
      // Marquer cette version comme refusée
      localStorage.setItem('dismissed_version', latestVersion.version_code.toString());
    }
    setShowUpdateDialog(false);
  };

  const handleRemindLater = () => {
    setShowUpdateDialog(false);
    // Proposer à nouveau dans 24h
    setTimeout(() => {
      if (updateAvailable) {
        setShowUpdateDialog(true);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures
  };

  if (!updateAvailable || !latestVersion) {
    return null;
  }

  return (
    <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Mise à jour disponible
          </DialogTitle>
          <DialogDescription>
            Une nouvelle version de l'application est disponible.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">
              Version {latestVersion.version_name}
            </h4>
            {latestVersion.release_notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Nouveautés :</p>
                <p>{latestVersion.release_notes}</p>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Votre version actuelle : 1.0.0</p>
            <p>Nouvelle version : {latestVersion.version_name}</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDismiss} size="sm">
            <X className="w-4 h-4 mr-2" />
            Ignorer
          </Button>
          <Button variant="outline" onClick={handleRemindLater} size="sm">
            Plus tard
          </Button>
          <Button onClick={handleDownload} size="sm" className="bg-primary">
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateChecker;