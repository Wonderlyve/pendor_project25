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
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border/40">
          <DialogTitle className="flex flex-col items-start gap-2">
            <span className="text-lg font-bold text-foreground">Détails du {betTypeLabel}</span>
            <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-0">
              {matches.length} match{matches.length > 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Zone scrollable améliorée */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-5">
            {/* Bannière publicitaire */}
            <div className="relative overflow-hidden rounded-xl shadow-sm">
              <img
                src="/lovable-uploads/546931fd-e8a2-4958-9150-8ad8c4308659.png"
                alt="Winner.bet Application"
                className="w-full h-auto"
              />
            </div>

            {/* Informations utilisateur */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/30">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={prediction.user.avatar} alt={prediction.user.username} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {prediction.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{prediction.user.username}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {prediction.successRate}% de réussite • Badge {prediction.user.badge}
                </div>
              </div>
            </div>

            {/* Matchs sélectionnés */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                <span>⚡</span>
                Matchs sélectionnés ({matches.length} match{matches.length > 1 ? 's' : ''})
              </h4>

              <div className="space-y-2.5">
                {matches.map((match, index) => (
                  <div
                    key={match.id || index}
                    className="p-4 border border-border/40 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground leading-tight mb-2">{match.teams}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span>⚽</span> {match.league}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>⏰</span> {match.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <span>🎯</span> Type : <span className="font-semibold text-foreground">{match.betType || 'Standard'}</span>
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 font-semibold text-xs px-3 py-1.5 whitespace-nowrap">
                        {match.prediction}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Côte totale pour pari combiné */}
            {prediction.totalOdds && prediction.betType === 'combine' && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <span className="font-semibold text-amber-800 text-sm">Côte totale combinée</span>
                  </div>
                  <span className="text-xl font-bold text-amber-600">
                    {prediction.totalOdds}
                  </span>
                </div>
              </div>
            )}

            {/* Code de réservation */}
            {prediction.reservationCode && (
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-5 rounded-xl text-center shadow-lg">
                <div className="text-xs font-medium mb-2 opacity-90 uppercase tracking-wider">Code de réservation</div>
                <div className="text-2xl font-bold tracking-[0.2em]">
                  {prediction.reservationCode}
                </div>
              </div>
            )}

            {/* Analyse */}
            <div className="bg-sky-50/80 border border-sky-200/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <span className="font-semibold text-sky-900 text-sm">Analyse détaillée</span>
              </div>
              <p className="text-sky-800 text-sm leading-relaxed">{prediction.analysis}</p>
            </div>

            {/* Niveau de confiance */}
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-semibold text-amber-800 text-sm">Niveau de confiance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${
                          i < prediction.confidence 
                            ? 'bg-amber-400 shadow-sm shadow-amber-400/50' 
                            : 'bg-amber-200/60'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-amber-700 font-bold text-sm">
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