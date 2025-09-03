import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Match {
  id: string;
  teams: string;
  prediction: string;
  odds: string;
  league: string;
  time: string;
  betType?: string; // Type spécifique du match (ex: double chance, 1x2, under/over…)
}

interface MultipleBetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prediction: {
    id: string;
    user: {
      username: string;
      avatar: string;
      badge: string;
      badgeColor: string;
    };
    match: string;
    prediction: string;
    odds: string;
    confidence: number;
    analysis: string;
    successRate: number;
    sport: string;
    totalOdds?: string;
    reservationCode?: string;
    betType?: string; // simple, combine, multiple
    selectedBetType?: string; // Type de pari choisi par l'utilisateur
    matches?: Match[];
    matches_data?: string;
  };
}

const MultipleBetModal = ({ open, onOpenChange, prediction }: MultipleBetModalProps) => {
  // Normalisation d'un match individuel
  const normalizeMatch = (match: any, index: number, fallbackData: any) => ({
    id: match.id || `match-${index}`,
    teams:
      match.homeTeam && match.awayTeam
        ? `${match.homeTeam} vs ${match.awayTeam}`
        : match.team1 && match.team2 
        ? `${match.team1} vs ${match.team2}`
        : match.teams || match.match || fallbackData.match,
    prediction: match.pronostic || match.prediction || fallbackData.prediction,
    odds: match.odd || match.odds || fallbackData.odds,
    league: match.sport || match.league || fallbackData.sport,
    time: match.time || match.heure || '20:00',
    // Récupération prioritaire du type de pari choisi par l'utilisateur
    betType: match.selectedBetType || match.betType || match.typeProno || match.type_pari || 
             match.typePari || match.bet_type || match.pariType || match.typeOfBet || 
             match.marketType || match.customBet || match.betOption || match.option || 
             // Ne pas utiliser de fallback automatique vers 1X2, préserver le type réel
             null,
  });

  // Division de matchs multiples séparés par "|"
  const splitMultipleMatches = (matchString: string, predictionString: string, oddsString: string) => {
    const matchParts = matchString.split('|').map(m => m.trim());
    const predictionParts = predictionString.split('|').map(p => p.trim());
    const oddsParts = oddsString.split('|').map(o => o.trim());

    return matchParts.map((match, index) => ({
      id: `split-${index}`,
      teams: match,
      prediction: predictionParts[index] || predictionParts[0] || predictionString,
      odds: oddsParts[index] || oddsParts[0] || oddsString,
      league: prediction.sport,
      time: '20:00',
      // Garder le type null si pas spécifié pour les matchs séparés
      betType: null,
    }));
  };

  // Préparer les matchs
  let matches: Match[] = [];

  if (prediction.matches_data) {
    try {
      const matchesData = JSON.parse(prediction.matches_data);

      if (Array.isArray(matchesData)) {
        matches = matchesData.map((match, index) => normalizeMatch(match, index, prediction));
      } else if (matchesData.lotoNumbers) {
        matches = [
          {
            id: 'loto-1',
            teams: 'Loto',
            prediction: `Numéros: ${matchesData.lotoNumbers.join(', ')}`,
            odds: '',
            league: 'Loto',
            time: '',
            betType: 'Loto',
          },
        ];
      } else if (matchesData.homeTeam || matchesData.teams || matchesData.team1) {
        matches = [normalizeMatch(matchesData, 0, prediction)];
      }
    } catch (error) {
      console.error('Erreur parsing matches_data:', error);
    }
  }

  if (matches.length === 0 && prediction.matches && prediction.matches.length > 0) {
    matches = prediction.matches.map((match, index) => normalizeMatch(match, index, prediction));
  }

  if (matches.length === 0) {
    if (prediction.match && prediction.match.includes('|')) {
      matches = splitMultipleMatches(
        prediction.match,
        prediction.prediction || '',
        prediction.odds || ''
      );
    } else {
      matches = [
        {
          id: 'default-1',
          teams: prediction.match,
          prediction: prediction.prediction,
          odds: prediction.odds,
          league: prediction.sport,
          time: '20:00',
          // Utiliser le type de pari principal s'il existe
          betType: prediction.betType === 'simple' ? prediction.selectedBetType || null : null,
        },
      ];
    }
  }

  const isMultipleBet =
    prediction.betType === 'combine' || prediction.betType === 'multiple' || matches.length > 1;
  const betTypeLabel = prediction.betType === 'combine' ? 'Pari Combiné' : 'Paris Multiples';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold">Détails du {betTypeLabel}</span>
            <Badge variant="outline" className="text-xs">
              {matches.length} match{matches.length > 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Zone scrollable améliorée */}
        <div className="flex-1 overflow-y-auto px-4 pr-2">
          <div className="space-y-4 pb-4 pr-2">
            {/* Bannière publicitaire */}
            <div className="relative">
              <img
                src="/lovable-uploads/546931fd-e8a2-4958-9150-8ad8c4308659.png"
                alt="Winner.bet Application"
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Informations utilisateur */}
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={prediction.user.avatar} alt={prediction.user.username} />
                <AvatarFallback>{prediction.user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm">{prediction.user.username}</div>
                <div className="text-xs text-muted-foreground">
                  {prediction.successRate}% de réussite • Badge {prediction.user.badge}
                </div>
              </div>
            </div>

            {/* Matchs sélectionnés */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Matchs sélectionnés ({matches.length} match{matches.length > 1 ? 's' : ''})
              </h4>

              {matches.map((match, index) => (
                <div
                  key={match.id || index}
                  className="p-3 mb-2 border rounded-xl shadow-sm bg-background"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{match.teams}</p>
                      <p className="text-muted-foreground text-xs">
                        ⚽ {match.league} • ⏰ {match.time}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        🎯 Type :{' '}
                        <span className="font-medium">
                          {match.betType || 'Standard'}
                        </span>
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                        {match.prediction}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Côte totale pour pari combiné */}
            {prediction.totalOdds && prediction.betType === 'combine' && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-semibold text-orange-800 text-sm">Côte totale combinée</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {prediction.totalOdds}
                  </span>
                </div>
              </div>
            )}

            {/* Code de réservation */}
            {prediction.reservationCode && (
              <div className="bg-green-500 text-white p-4 rounded-lg text-center">
                <div className="text-sm font-medium mb-1">CODE DE RÉSERVATION</div>
                <div className="text-xl font-bold tracking-widest">
                  {prediction.reservationCode}
                </div>
              </div>
            )}

            {/* Analyse */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">💡</span>
                <span className="font-medium text-blue-900 text-sm">Analyse détaillée</span>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">{prediction.analysis}</p>
            </div>

            {/* Niveau de confiance */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-medium text-yellow-800 text-sm">Niveau de confiance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          i < prediction.confidence ? 'bg-yellow-400' : 'bg-yellow-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-yellow-700 font-medium text-sm">
                    {prediction.confidence}/5
                    {prediction.confidence === 5 ? ' 🚀' : prediction.confidence >= 4 ? ' 🔥' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleBetModal;