import { useState } from 'react';
import { X, Calendar, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';

interface Match {
  id: number;
  teams: string;
  prediction: string;
  odds: string;
  league: string;
  time: string;
}

interface CreatePredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePredictionModal = ({ open, onOpenChange }: CreatePredictionModalProps) => {
  const { createPost } = useOptimizedPosts();
  
  const [betType, setBetType] = useState<'simple' | 'combine' | 'loto'>('simple');
  const [matches, setMatches] = useState<Match[]>([
    { id: 1, teams: '', prediction: '', odds: '', league: '', time: '' }
  ]);
  const [analysis, setAnalysis] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [sport, setSport] = useState('');
  const [reservationCode, setReservationCode] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [lotoNumbers, setLotoNumbers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMatch = () => {
    const newMatch: Match = {
      id: matches.length + 1,
      teams: '',
      prediction: '',
      odds: '',
      league: '',
      time: ''
    };
    setMatches([...matches, newMatch]);
  };

  const removeMatch = (id: number) => {
    if (matches.length > 1) {
      setMatches(matches.filter(match => match.id !== id));
    }
  };

  const updateMatch = (id: number, field: keyof Match, value: string) => {
    setMatches(matches.map(match => 
      match.id === id ? { ...match, [field]: value } : match
    ));
  };

  const calculateTotalOdds = () => {
    const validOdds = matches.filter(m => m.odds && !isNaN(parseFloat(m.odds)));
    if (validOdds.length === 0) return '0.00';
    return validOdds.reduce((total, match) => total * parseFloat(match.odds), 1).toFixed(2);
  };

  const toggleLotoNumber = (number: number) => {
    if (lotoNumbers.includes(number)) {
      setLotoNumbers(lotoNumbers.filter(n => n !== number));
    } else if (lotoNumbers.length < 6) {
      setLotoNumbers([...lotoNumbers, number].sort((a, b) => a - b));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let postData;
      
      if (betType === 'loto') {
        postData = {
          analysis,
          confidence,
          odds: 0,
          sport: 'Loto',
          prediction_text: `Numéros: ${lotoNumbers.join(', ')}`,
          reservation_code: reservationCode || null,
          image_file: selectedImage,
          video_file: selectedVideo
        };
      } else {
        const validMatches = matches.filter(m => m.teams && m.prediction && m.odds);
        if (validMatches.length === 0) {
          toast.error('Veuillez remplir au moins un match complet');
          return;
        }

        const totalOdds = betType === 'combine' ? parseFloat(calculateTotalOdds()) : parseFloat(validMatches[0].odds);
        
        // Stocker les informations des matchs pour les paris combinés
        const matchesData = betType === 'combine' ? validMatches : null;
        
        postData = {
          sport,
          match_teams: validMatches.map(m => m.teams).join(' | '),
          prediction_text: validMatches.map(m => m.prediction).join(' | '),
          analysis,
          confidence,
          odds: totalOdds,
          reservation_code: reservationCode || null,
          bet_type: betType,
          matches_data: matchesData ? JSON.stringify(matchesData) : null,
          image_file: selectedImage,
          video_file: selectedVideo
        };
      }

      const result = await createPost(postData);
      
      if (result) {
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erreur lors de la création du post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMatches([{ id: 1, teams: '', prediction: '', odds: '', league: '', time: '' }]);
    setAnalysis('');
    setConfidence(3);
    setSport('');
    setReservationCode('');
    setSelectedImage(null);
    setSelectedVideo(null);
    setBetType('simple');
    setLotoNumbers([]);
  };

  const isFormValid = () => {
    if (betType === 'loto') {
      return lotoNumbers.length >= 1 && analysis.trim();
    }
    return matches.some(m => m.teams && m.prediction && m.odds) && 
           analysis.trim() && 
           sport;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>Nouveau Pronostic</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {/* Type de pari */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Type de pari
              </label>
              <Select value={betType} onValueChange={(value: 'simple' | 'combine' | 'loto') => setBetType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Pari Simple</SelectItem>
                  <SelectItem value="combine">Pari Combiné</SelectItem>
                  <SelectItem value="loto">Pronostic Loto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {betType === 'loto' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Choisissez vos numéros (1-6 numéros) : {lotoNumbers.length}/6
                </label>
                <div className="grid grid-cols-9 gap-1">
                  {Array.from({ length: 90 }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => toggleLotoNumber(number)}
                      className={`w-8 h-8 text-xs rounded-full border transition-colors ${
                        lotoNumbers.includes(number)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      disabled={!lotoNumbers.includes(number) && lotoNumbers.length >= 6}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                {lotoNumbers.length > 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">
                      Numéros sélectionnés: {lotoNumbers.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {betType !== 'loto' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sport / Compétition
                </label>
                <Input
                  placeholder="Ex: Football, Tennis, Basketball..."
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                />
              </div>
            )}

            {betType === 'combine' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-800 text-sm">Cote totale calculée</span>
                  <span className="text-lg font-bold text-orange-600">
                    {calculateTotalOdds()}
                  </span>
                </div>
              </div>
            )}

            {betType !== 'loto' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {betType === 'combine' ? 'Matchs du combiné' : 'Match'}
                  </label>
                  {betType === 'combine' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMatch}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Ajouter
                    </Button>
                  )}
                </div>
                
                {/* Affichage en liste verticale pour les paris combinés */}
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <Card key={match.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            {betType === 'combine' ? `Match ${index + 1}` : 'Match'}
                          </span>
                          {betType === 'combine' && matches.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMatch(match.id)}
                              className="text-red-500 p-1 h-auto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Input
                            placeholder="Équipes (ex: PSG vs Real Madrid)"
                            value={match.teams}
                            onChange={(e) => updateMatch(match.id, 'teams', e.target.value)}
                            className="text-sm"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Compétition"
                              value={match.league}
                              onChange={(e) => updateMatch(match.id, 'league', e.target.value)}
                              className="text-sm"
                            />
                            <Input
                              placeholder="Heure"
                              value={match.time}
                              onChange={(e) => updateMatch(match.id, 'time', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          
                          <Input
                            placeholder="Votre pronostic (ex: Victoire PSG)"
                            value={match.prediction}
                            onChange={(e) => updateMatch(match.id, 'prediction', e.target.value)}
                            className="text-sm"
                          />
                          
                          <Input
                            placeholder="Cote (ex: 2.10)"
                            value={match.odds}
                            onChange={(e) => updateMatch(match.id, 'odds', e.target.value)}
                            type="number"
                            step="0.01"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {betType === 'loto' ? 'Analyse de votre grille' : 'Analyse détaillée'}
              </label>
              <Textarea
                placeholder={betType === 'loto' ? 'Expliquez votre stratégie, vos numéros fétiches...' : 'Expliquez votre analyse, les statistiques, la forme des équipes...'}
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Niveau de confiance: {confidence}/5
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star)}
                    className={`text-2xl ${
                      star <= confidence ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <Card className="p-3">
              <FileUpload
                onImageSelect={setSelectedImage}
                onVideoSelect={setSelectedVideo}
                selectedImage={selectedImage}
                selectedVideo={selectedVideo}
              />
            </Card>

            {/* Code de réservation */}
            {betType !== 'loto' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Code de réservation (optionnel)
                </label>
                <Input
                  placeholder="Ex: 255FGJ2586"
                  value={reservationCode}
                  onChange={(e) => setReservationCode(e.target.value)}
                  className="font-mono text-center font-bold"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex space-x-3 pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? 'Publication...' : 'Publier'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePredictionModal;
