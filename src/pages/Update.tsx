import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProtectedComponent from '@/components/ProtectedComponent';

const Update = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    version_name: '',
    version_code: '',
    release_notes: '',
    apk_file: null as File | null
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.apk')) {
      setFormData({ ...formData, apk_file: file });
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier APK valide",
        variant: "destructive"
      });
    }
  };

  const uploadApkFile = async (file: File, versionName: string) => {
    const fileName = `${versionName}-${Date.now()}.apk`;
    const { data, error } = await supabase.storage
      .from('apk-files')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('apk-files')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (!formData.apk_file) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier APK",
          variant: "destructive"
        });
        return;
      }

      // Upload APK file
      const apkUrl = await uploadApkFile(formData.apk_file, formData.version_name);

      // Désactiver toutes les versions précédentes
      await supabase
        .from('app_versions')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Créer la nouvelle version
      const { error: insertError } = await supabase
        .from('app_versions')
        .insert({
          version_name: formData.version_name,
          version_code: parseInt(formData.version_code),
          apk_url: apkUrl,
          release_notes: formData.release_notes,
          is_active: true
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Nouvelle version publiée avec succès"
      });

      // Reset form
      setFormData({
        version_name: '',
        version_code: '',
        release_notes: '',
        apk_file: null
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
                  Publier une nouvelle version
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version_name">Nom de version</Label>
                      <Input
                        id="version_name"
                        placeholder="ex: 1.2.0"
                        value={formData.version_name}
                        onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version_code">Code de version</Label>
                      <Input
                        id="version_code"
                        type="number"
                        placeholder="ex: 120"
                        value={formData.version_code}
                        onChange={(e) => setFormData({ ...formData, version_code: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="release_notes">Notes de version</Label>
                    <Textarea
                      id="release_notes"
                      placeholder="Décrivez les nouveautés et corrections..."
                      value={formData.release_notes}
                      onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apk_file">Fichier APK</Label>
                    <Input
                      id="apk_file"
                      type="file"
                      accept=".apk"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      required
                    />
                    {formData.apk_file && (
                      <p className="text-sm text-muted-foreground">
                        Fichier sélectionné: {formData.apk_file.name}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={uploading} className="w-full">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Publication en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Publier la mise à jour
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Informations importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Attention
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Une seule version peut être active à la fois</li>
                    <li>• Tous les utilisateurs avec une version antérieure recevront une notification</li>
                    <li>• Assurez-vous que le fichier APK fonctionne correctement avant publication</li>
                    <li>• Les notes de version seront visibles par tous les utilisateurs</li>
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