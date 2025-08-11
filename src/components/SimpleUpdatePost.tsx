import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdatePost {
  id: string;
  version_name: string;
  description: string | null;
  update_url: string;
  is_active: boolean;
  created_at: string;
}

const SimpleUpdatePost = () => {
  const [updatePost, setUpdatePost] = useState<UpdatePost | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkForUpdatePost();
  }, []);

  const checkForUpdatePost = async () => {
    try {
      const { data: activePost, error } = await supabase
        .from('update_posts')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la vérification des posts de mise à jour:', error);
        return;
      }

      if (!activePost) {
        console.log('Aucun post de mise à jour actif trouvé');
        return;
      }

      setUpdatePost(activePost);
      
      // Vérifier si l'utilisateur a déjà refusé ce post spécifique
      const dismissedPost = localStorage.getItem('dismissed_update_post');
      if (dismissedPost === activePost.id) {
        setIsDismissed(true);
      } else {
        // Nouveau post ou pas encore ignoré, s'assurer qu'il est visible
        setIsDismissed(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des posts de mise à jour:', error);
    }
  };

  const handleUpdate = () => {
    if (updatePost?.update_url) {
      // Ouvrir le lien dans un nouvel onglet
      window.open(updatePost.update_url, '_blank');
      
      // Marquer comme cliqué
      localStorage.setItem('clicked_update_post', updatePost.id);
    }
  };

  const handleDismiss = () => {
    if (updatePost) {
      localStorage.setItem('dismissed_update_post', updatePost.id);
      setIsDismissed(true);
    }
  };

  if (!updatePost || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Mise à jour disponible</h3>
            <p className="text-white/90 text-sm">{updatePost.version_name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-white hover:bg-white/20 text-xs"
        >
          Ignorer
        </Button>
      </div>
      
      {updatePost.description && (
        <div className="mb-4">
          <p className="text-white/90 text-sm">
            {updatePost.description}
          </p>
        </div>
      )}
      
      <Button
        onClick={handleUpdate}
        className="bg-white text-blue-600 hover:bg-white/90 font-medium"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Mettre à jour
      </Button>
    </div>
  );
};

export default SimpleUpdatePost;