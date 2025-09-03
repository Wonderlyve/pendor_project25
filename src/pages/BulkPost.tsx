import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

interface CSVRow {
  content: string;
  sport?: string;
  match_teams?: string;
  prediction_text?: string;
  analysis: string;
  odds: number;
  confidence: number;
  username?: string;
  bet_type?: string; // 'simple' or 'combine'
  match_time?: string;
}

const BulkPost = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [templateType, setTemplateType] = useState<'simple' | 'combine'>('simple');
  const { createPost } = usePosts();
  const { user } = useAuth();

  const downloadTemplate = () => {
    let csvContent = "";
    let filename = "";
    
    if (templateType === 'simple') {
      csvContent = "content,sport,match_teams,prediction_text,analysis,odds,confidence,username,bet_type,match_time\n" +
        "Analyse du match PSG vs Real,Football,PSG vs Real Madrid,PSG gagnant,Le PSG joue à domicile et a une meilleure forme récente,1.85,85,winwin,simple,2024-12-15 21:00:00\n" +
        "Pronostic tennis,Tennis,Nadal vs Djokovic,Nadal gagnant,Nadal excelle sur terre battue,2.10,75,starpro,simple,2024-12-16 15:30:00";
      filename = 'template_posts_simple.csv';
    } else {
      csvContent = "content,sport,match_teams,prediction_text,analysis,odds,confidence,username,bet_type,match_time\n" +
        "Combiné 3 matchs Football,Football,PSG vs Real Madrid | Barcelona vs Bayern | Liverpool vs City,PSG gagnant | Barcelona gagnant | Liverpool gagnant,Excellent combiné avec 3 équipes favorites à domicile,8.50,90,winwin,combine,2024-12-15 20:00:00\n" +
        "Combiné Tennis + Football,Multi-Sport,Djokovic vs Nadal | Chelsea vs Arsenal,Djokovic gagnant | Chelsea gagnant,Deux favoris logiques pour ce combiné,4.20,80,starpro,combine,2024-12-16 14:00:00";
      filename = 'template_posts_combine.csv';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        const value = values[i] || '';
        if (header === 'odds' || header === 'confidence') {
          row[header] = parseFloat(value) || 0;
        } else {
          row[header] = value;
        }
      });
      
      // Validation des champs requis
      if (!row.content || !row.analysis) {
        throw new Error(`Ligne ${index + 2}: Les champs 'content' et 'analysis' sont requis`);
      }
      
      // Validation du nom d'utilisateur si fourni
      if (row.username && !['winwin', 'starpro', 'Patrickprono', 'victoirepro'].includes(row.username)) {
        throw new Error(`Ligne ${index + 2}: Le nom d'utilisateur doit être winwin, starpro, Patrickprono ou victoirepro`);
      }
      
      // Validation du type de pari
      if (row.bet_type && !['simple', 'combine'].includes(row.bet_type)) {
        throw new Error(`Ligne ${index + 2}: Le type de pari doit être 'simple' ou 'combine'`);
      }
      
      // Valeur par défaut pour bet_type
      if (!row.bet_type) {
        row.bet_type = 'simple';
      }
      
      return row as CSVRow;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedData = parseCSV(text);
          setCsvData(parsedData);
          toast.success(`${parsedData.length} posts détectés dans le fichier CSV`);
        } catch (error) {
          toast.error(`Erreur lors de l'analyse du CSV: ${error}`);
          setCsvData([]);
        }
      };
      reader.readAsText(selectedFile, 'UTF-8');
    } else {
      toast.error('Veuillez sélectionner un fichier CSV valide');
    }
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImages = Array.from(event.target.files || []);
    const validImages = selectedImages.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // Max 10MB
    );
    
    if (validImages.length !== selectedImages.length) {
      toast.error('Certains fichiers ont été ignorés (taille > 10MB ou format non supporté)');
    }
    
    setImages(validImages);
    if (validImages.length > 0) {
      toast.success(`${validImages.length} images importées`);
    }
  };

  const processAllPosts = async () => {
    if (csvData.length === 0) {
      toast.error('Aucune donnée à traiter');
      return;
    }

    if (images.length > 0 && images.length !== csvData.length) {
      toast.error(`Le nombre d'images (${images.length}) doit correspondre au nombre de posts (${csvData.length}) ou être vide`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults({ success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const image = images[i] || null;
      
      try {
        await createPost({
          sport: row.sport,
          match_teams: row.match_teams,
          prediction_text: row.prediction_text,
          analysis: row.analysis,
          odds: row.odds,
          confidence: row.confidence,
          username: row.username || 'Smart',
          bet_type: row.bet_type || 'simple',
          match_time: row.match_time,
          image_file: image
        });
        successCount++;
      } catch (error) {
        failedCount++;
        console.error(`Erreur post ${i + 1}:`, error);
      }
      
      setProgress(((i + 1) / csvData.length) * 100);
      setResults({ success: successCount, failed: failedCount });
      
      // Petite pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} posts créés avec succès !`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} posts ont échoué`);
    }
  };

  if (!user || (user.email !== 'smart@example.com' && user.user_metadata?.display_name !== 'Smart')) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Cette fonctionnalité est réservée à l'utilisateur Smart.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Publication en masse</h1>
            <p className="text-muted-foreground">Importez un fichier CSV pour créer plusieurs posts simultanément</p>
          </div>

          <div className="grid gap-6">
            {/* Template Download */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Modèle CSV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Choisissez le type de posts à créer et téléchargez le modèle CSV correspondant.
                  </p>
                  
                  {/* Sélecteur de type */}
                  <div className="flex gap-2">
                    <Button
                      variant={templateType === 'simple' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTemplateType('simple')}
                    >
                      Paris Simples
                    </Button>
                    <Button
                      variant={templateType === 'combine' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTemplateType('combine')}
                    >
                      Paris Combinés
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">
                      {templateType === 'simple' ? 'Paris Simples' : 'Paris Combinés'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {templateType === 'simple' 
                        ? 'Un pari par ligne avec un seul match et une seule prédiction.'
                        : 'Plusieurs matchs combinés sur une même ligne. Séparez les matchs et prédictions par " | ".'
                      }
                    </p>
                  </div>
                  
                  <Button onClick={downloadTemplate} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le modèle {templateType === 'simple' ? 'Paris Simples' : 'Paris Combinés'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importer les fichiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csv-file">Fichier CSV (UTF-8)</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Le fichier CSV doit être encodé en UTF-8 pour supporter les accents
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="images-file">Images (optionnel)</Label>
                    <Input
                      id="images-file"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sélectionnez des images dans l'ordre correspondant aux posts CSV (max 10MB chacune)
                    </p>
                  </div>
                  
                  {file && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Fichier CSV: {file.name} ({csvData.length} posts détectés)
                      </AlertDescription>
                    </Alert>
                  )}

                  {images.length > 0 && (
                    <Alert>
                      <ImageIcon className="h-4 w-4" />
                      <AlertDescription>
                        {images.length} images importées
                        {csvData.length > 0 && images.length !== csvData.length && (
                          <span className="text-orange-600 ml-2">
                            ⚠️ Le nombre d'images ({images.length}) ne correspond pas au nombre de posts ({csvData.length})
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {csvData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu des données</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {csvData.length} posts prêts à être publiés
                    </p>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {csvData.slice(0, 5).map((row, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex gap-3">
                            {images[index] && (
                              <div className="flex-shrink-0">
                                <img
                                  src={URL.createObjectURL(images[index])}
                                  alt={`Preview ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium truncate">{row.content}</p>
                              <p className="text-sm text-muted-foreground">
                                {row.sport} • {row.match_teams} • Cote: {row.odds} • Confiance: {row.confidence}% • Type: {row.bet_type === 'combine' ? 'Combiné' : 'Simple'} • Utilisateur: {row.username || 'Smart'}
                                {row.match_time && ` • Match: ${new Date(row.match_time).toLocaleString('fr-FR')}`}
                              </p>
                              {images[index] && (
                                <p className="text-xs text-green-600 mt-1">
                                  📷 Image associée: {images[index].name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {csvData.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          ... et {csvData.length - 5} autres posts
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Process */}
            {csvData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Publication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isProcessing && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progression</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}
                    
                    {(results.success > 0 || results.failed > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-700">Succès: {results.success}</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="text-red-700">Échecs: {results.failed}</span>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={processAllPosts} 
                      disabled={isProcessing || csvData.length === 0}
                      className="w-full"
                    >
                      {isProcessing ? 'Publication en cours...' : `Publier ${csvData.length} posts`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPost;