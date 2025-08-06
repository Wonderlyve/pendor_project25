import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Link as LinkIcon, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProtectedComponent from '@/components/ProtectedComponent';

const Update = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    version_name: '',
    description: '',
    update_url: ''
  });

  // Vérifier si l'utilisateur est Smart
  console.log('Current user:', user);
  console.log('User email:', user?.email);
  console.log('User metadata:', user?.user_metadata);
  console.log('Display name:', user?.user_metadata?.display_name);
  
  const isSmartUser = user?.email === 'smart@example.com' || user?.email?.includes('padmin') || user?.user_metadata?.display_name === 'Smart';
  console.log('Is Smart user:', isSmartUser);

  if (!isSmartUser) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center py-12">
            <Smartphone className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
            <p className="text-muted-foreground">Cette fonctionnalité est réservée aux administrateurs.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (!formData.update_url) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer un lien de mise à jour",
          variant: "destructive"
        });
        return;
      }

      // Désactiver tous les posts de mise à jour précédents
      await supabase
        .from('update_posts')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Créer le nouveau post de mise à jour
      const { error: insertError } = await supabase
        .from('update_posts')
        .insert({
          user_id: user?.id,
          version_name: formData.version_name,
          description: formData.description,
          update_url: formData.update_url,
          is_active: true
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Post de mise à jour créé avec succès"
      });

      // Reset form
      setFormData({
        version_name: '',
        description: '',
        update_url: ''
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedComponent>
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Mise à jour de l'application</h1>
              <p className="text-muted-foreground">Publier une nouvelle version de l'app</p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Créer un post de mise à jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="version_name">Nom de version</Label>
                    <Input
                      id="version_name"
                      placeholder="ex: Version 1.2.0"
                      value={formData.version_name}
                      onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description de la mise à jour</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez les nouveautés et améliorations..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="update_url">Lien de mise à jour</Label>
                    <Input
                      id="update_url"
                      type="url"
                      placeholder="https://example.com/download-app"
                      value={formData.update_url}
                      onChange={(e) => setFormData({ ...formData, update_url: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={uploading} className="w-full">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Créer le post de mise à jour
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Informations importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Attention
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Un seul post de mise à jour peut être actif à la fois</li>
                    <li>• Le post apparaîtra sur le feed principal de tous les utilisateurs</li>
                    <li>• Le lien s'ouvrira quand les utilisateurs cliqueront sur "Mettre à jour"</li>
                    <li>• Assurez-vous que le lien de téléchargement fonctionne correctement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
};

export default Update;