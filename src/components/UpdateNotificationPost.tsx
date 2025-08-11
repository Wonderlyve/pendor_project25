import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppVersion {
  id: string;
  version_name: string;
  version_code: number;
  apk_url: string;
  release_notes: string;
  is_active: boolean;
  created_at: string;
}

const UpdateNotificationPost = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Version actuelle de l'app
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
        
        // Vérifier si l'utilisateur a déjà refusé cette version spécifique
        const dismissedVersion = localStorage.getItem('dismissed_update_post');
        if (dismissedVersion === activeVersion.version_code.toString()) {
          setIsDismissed(true);
        } else {
          // Nouvelle version ou pas encore ignorée, s'assurer qu'elle est visible
          setIsDismissed(false);
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
      
      // Marquer comme téléchargé
      localStorage.setItem('downloaded_version', latestVersion.version_code.toString());
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    if (latestVersion) {
      localStorage.setItem('dismissed_update_post', latestVersion.version_code.toString());
      setIsDismissed(true);
    }
  };

  if (!updateAvailable || !latestVersion || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 mb-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Mise à jour disponible</h3>
            <p className="text-white/90 text-sm">Version {latestVersion.version_name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {latestVersion.release_notes && (
        <div className="mb-4">
          <p className="text-white/90 text-sm">
            {latestVersion.release_notes}
          </p>
        </div>
      )}
      
      <Button
        onClick={handleDownload}
        className="bg-white text-green-600 hover:bg-white/90 font-medium"
      >
        <Download className="w-4 h-4 mr-2" />
        Télécharger maintenant
      </Button>
    </div>
  );
};

export default UpdateNotificationPost;