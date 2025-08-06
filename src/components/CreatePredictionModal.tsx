import { useState, useMemo } from 'react';
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
import LoadingModal from '@/components/LoadingModal';
import SuccessModal from '@/components/SuccessModal';
import { toast } from 'sonner';
import { teams, betTypes } from '@/data/teams';

interface Match {
  id: number;
  team1: string;
  team2: string;
  prediction: string;
  odds: string;
  league: string;
  time: string;
  betType: string;
  customBet?: string;
}

interface CreatePredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePredictionModal = ({ open, onOpenChange }: CreatePredictionModalProps) => {
  const { createPost } = useOptimizedPosts();
  
  const [betType, setBetType] = useState<'simple' | 'combine' | 'loto' | 'multiple'>('simple');
  const [matches, setMatches] = useState<Match[]>([
    { id: 1, team1: '', team2: '', prediction: '', odds: '', league: '', time: '', betType: '1X2' }
  ]);
  const [analysis, setAnalysis] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [sport, setSport] = useState('');
  const [reservationCode, setReservationCode] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [lotoNumbers, setLotoNumbers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // États pour le formulaire temporaire
  const [tempMatch, setTempMatch] = useState<Partial<Match>>({
    team1: '',
    team2: '',
    prediction: '',
    odds: '',
    league: '',
    time: '',
    betType: '1X2',
    customBet: ''
  });
  
  // Suggestions d'équipes basées sur l'input
  const team1Suggestions = useMemo(() => {
    if (!tempMatch.team1 || tempMatch.team1.length < 2) return [];
    return teams.filter(team => 
      team.name.toLowerCase().includes(tempMatch.team1?.toLowerCase() || '')
    ).slice(0, 5);
  }, [tempMatch.team1]);
  
  const team2Suggestions = useMemo(() => {
    if (!tempMatch.team2 || tempMatch.team2.length < 2) return [];
    return teams.filter(team => 
      team.name.toLowerCase().includes(tempMatch.team2?.toLowerCase() || '')
    ).slice(0, 5);
  }, [tempMatch.team2]);

  const addTempMatch = () => {
    if (!tempMatch.team1 || !tempMatch.team2 || !tempMatch.prediction || !tempMatch.odds) {
      toast.error('Veuillez remplir tous les champs du match');
      return;
    }
    
    const newMatch: Match = {
      id: Date.now(),
      team1: tempMatch.team1,
      team2: tempMatch.team2,
      prediction: tempMatch.prediction,
      odds: tempMatch.odds,
      league: tempMatch.league || 'Non spécifié',
      time: tempMatch.time || '00:00',
      betType: tempMatch.betType || '1X2',
      customBet: tempMatch.customBet
    };
    
    if (betType === 'simple') {
      setMatches([newMatch]);
    } else {
      setMatches([...matches, newMatch]);
    }
    
    // Réinitialiser le formulaire temporaire
    setTempMatch({
      team1: '',
      team2: '',
      prediction: '',
      odds: '',
      league: '',
      time: '',
      betType: '1X2',
      customBet: ''
    });
  };

  const removeMatch = (id: number) => {
    if (matches.length > 1) {
      setMatches(matches.filter(match => match.id !== id));
    }
  };

  const updateTempMatch = (field: keyof Match, value: string) => {
    setTempMatch(prev => ({ ...prev, [field]: value }));
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
    setShowLoadingModal(true);
    
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
        const validMatches = matches.filter(m => m.team1 && m.team2 && m.prediction && m.odds);
        if (validMatches.length === 0) {
          toast.error('Veuillez ajouter au moins un match complet');
          return;
        }

        const totalOdds = betType === 'combine' ? parseFloat(calculateTotalOdds()) : parseFloat(validMatches[0].odds);
        
        // Stocker les informations des matchs pour les paris combinés et multiples
        const matchesData = (betType === 'combine' || betType === 'multiple') ? validMatches : null;
        
        postData = {
          sport,
          match_teams: validMatches.map(m => `${m.team1} vs ${m.team2}`).join(' | '),
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
      
      setShowLoadingModal(false);
      
      if (result) {
        setShowSuccessModal(true);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setShowLoadingModal(false);
      toast.error('Erreur lors de la création du post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMatches([]);
    setTempMatch({
      team1: '',
      team2: '',
      prediction: '',
      odds: '',
      league: '',
      time: '',
      betType: '1X2',
      customBet: ''
    });
    setAnalysis('');
    setConfidence(3);
    setSport('');
    setReservationCode('');
    setSelectedImage(null);
    setSelectedVideo(null);
    setBetType('simple');
    setLotoNumbers([]);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onOpenChange(false);
  };

  const isFormValid = () => {
    if (betType === 'loto') {
      return lotoNumbers.length >= 1 && analysis.trim();
    }
    return matches.length > 0 && 
           matches.some(m => m.team1 && m.team2 && m.prediction && m.odds) && 
           analysis.trim() && 
           sport;
  };

  return (
    <>
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
              {/* Bannière publicitaire */}
              <div className="relative">
                <img 
                  src="/lovable-uploads/546931fd-e8a2-4958-9150-8ad8c4308659.png" 
                  alt="Winner.bet Application"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* Type de pari */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type de pari
                </label>
                <Select value={betType} onValueChange={(value: 'simple' | 'combine' | 'loto' | 'multiple') => setBetType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Pari Simple</SelectItem>
                    <SelectItem value="combine">Pari Combiné</SelectItem>
                    <SelectItem value="multiple">Paris Multiple</SelectItem>
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

              {betType === 'multiple' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-center">
                    <span className="font-medium text-blue-800 text-sm">📊 Paris Multiple - Chaque match analysé séparément</span>
                  </div>
                </div>
              )}

              {betType !== 'loto' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {betType === 'combine' ? 'Matchs du combiné' : betType === 'multiple' ? 'Matchs multiples' : 'Match'}
                  </label>
                  
                  {/* Formulaire d'ajout de match */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                    <div className="space-y-3">
                      {/* Équipes avec suggestions */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            placeholder="Équipe 1"
                            value={tempMatch.team1 || ''}
                            onChange={(e) => updateTempMatch('team1', e.target.value)}
                            className="text-sm"
                          />
                          {team1Suggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-32 overflow-y-auto">
                              {team1Suggestions.map((team) => (
                                <button
                                  key={team.id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => updateTempMatch('team1', team.name)}
                                >
                                  <img src={team.logo} alt={team.name} className="w-4 h-4 rounded-full" />
                                  <span>{team.name}</span>
                                  <span className="text-xs text-gray-500">({team.league})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="relative">
                          <Input
                            placeholder="Équipe 2"
                            value={tempMatch.team2 || ''}
                            onChange={(e) => updateTempMatch('team2', e.target.value)}
                            className="text-sm"
                          />
                          {team2Suggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-32 overflow-y-auto">
                              {team2Suggestions.map((team) => (
                                <button
                                  key={team.id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => updateTempMatch('team2', team.name)}
                                >
                                  <img src={team.logo} alt={team.name} className="w-4 h-4 rounded-full" />
                                  <span>{team.name}</span>
                                  <span className="text-xs text-gray-500">({team.league})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Compétition"
                          value={tempMatch.league || ''}
                          onChange={(e) => updateTempMatch('league', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Heure (ex: 20:00)"
                          value={tempMatch.time || ''}
                          onChange={(e) => updateTempMatch('time', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Select value={tempMatch.betType || '1X2'} onValueChange={(value) => updateTempMatch('betType', value)}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Type de pari" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {Object.keys(betTypes).map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {tempMatch.betType && tempMatch.betType !== 'Personnalisé' && betTypes[tempMatch.betType as keyof typeof betTypes].length > 0 && (
                          <Select value={tempMatch.prediction || ''} onValueChange={(value) => updateTempMatch('prediction', value)}>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Pronostic" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {betTypes[tempMatch.betType as keyof typeof betTypes].map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {(tempMatch.betType === 'Personnalisé' || !tempMatch.betType || betTypes[tempMatch.betType as keyof typeof betTypes]?.length === 0) && (
                          <Input
                            placeholder="Votre pronostic personnalisé"
                            value={tempMatch.prediction || ''}
                            onChange={(e) => updateTempMatch('prediction', e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                      
                      <Input
                        placeholder="Cote (ex: 2.10)"
                        type="number"
                        step="0.01"
                        value={tempMatch.odds || ''}
                        onChange={(e) => updateTempMatch('odds', e.target.value)}
                        className="text-sm"
                      />
                      
                      <Button
                        type="button"
                        onClick={addTempMatch}
                        className="w-full bg-blue-500 text-white hover:bg-blue-600"
                        disabled={!tempMatch.team1 || !tempMatch.team2 || !tempMatch.prediction || !tempMatch.odds}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter ce match
                      </Button>
                    </div>
                  </div>
                  
                  {/* Liste des matchs ajoutés - Format optimisé selon le type */}
                  {matches.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h5 className="text-sm font-medium text-gray-700">Matchs sélectionnés ({matches.length}):</h5>
                      
                      {(betType === 'multiple' || betType === 'combine') ? (
                        /* Affichage tableau optimisé mobile pour Paris Multiple et Combiné */
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Header du tableau */}
                          <div className="bg-gray-50 px-3 py-2 border-b">
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
                              <div className="col-span-4">Équipes</div>
                              <div className="col-span-4">Pronostic</div>
                              <div className="col-span-2 text-center">Côte</div>
                              <div className="col-span-2 text-center">Action</div>
                            </div>
                          </div>
                          
                          {/* Corps du tableau */}
                          <div className="divide-y">
                            {matches.map((match, index) => (
                              <div key={match.id} className="px-3 py-3">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                  {/* Équipes */}
                                  <div className="col-span-4">
                                    <div className="text-sm font-medium text-gray-900 leading-tight">
                                      {match.team1} vs {match.team2}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {match.league} • {match.time}
                                    </div>
                                  </div>
                                  
                                  {/* Pronostic */}
                                  <div className="col-span-4">
                                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full mb-1">
                                      {match.betType}
                                    </span>
                                    <div className="text-xs font-medium text-gray-900">
                                      {match.prediction}
                                    </div>
                                  </div>
                                  
                                  {/* Côte */}
                                  <div className="col-span-2 text-center">
                                    <div className="text-sm font-bold text-green-600">
                                      {match.odds}
                                    </div>
                                  </div>
                                  
                                  {/* Action */}
                                  <div className="col-span-2 text-center">
                                    {matches.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMatch(match.id)}
                                        className="text-red-500 p-1 h-auto hover:bg-red-50"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Affichage cartes pour autres types */
                        <div className="space-y-2">
                          {matches.map((match) => (
                            <Card key={match.id} className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{match.team1} vs {match.team2}</div>
                                    <div className="text-xs text-gray-500">
                                      {match.league} • {match.time}
                                    </div>
                                  </div>
                                   {betType === 'simple' && matches.length > 1 && (
                                     <Button
                                       type="button"
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => removeMatch(match.id)}
                                       className="text-red-500 p-1 h-auto hover:bg-red-50 ml-2"
                                     >
                                       <Trash2 className="w-4 h-4" />
                                     </Button>
                                   )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex space-x-2">
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                      {match.betType}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                      {match.prediction}
                                    </span>
                                  </div>
                                  <span className="text-sm font-bold text-green-600">{match.odds}</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
      
      <LoadingModal
        isOpen={showLoadingModal}
        title="Publication en cours..."
        description="Votre pronostic est en cours de publication, veuillez patienter."
      />
      
      <SuccessModal
        isOpen={showSuccessModal}
        title="Pronostic publié !"
        description="Votre pronostic a été publié avec succès et est maintenant visible par tous."
        onClose={handleSuccessClose}
      />
    </>
  );
};

export default CreatePredictionModal;
