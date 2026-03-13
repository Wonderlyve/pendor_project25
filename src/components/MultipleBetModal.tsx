import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Match {
  id: string;
  teams: string;
  prediction: string;
  odds: string;
  league: string;
  time: string;
  betType?: string;
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
    betType?: string;
    selectedBetType?: string;
    matches?: Match[];
    matches_data?: string;
  };
}

const MultipleBetModal = ({ open, onOpenChange, prediction }: MultipleBetModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (prediction.reservationCode) {
      await navigator.clipboard.writeText(prediction.reservationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
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
    betType: match.selectedBetType || match.betType || match.typeProno || match.type_pari ||
             match.typePari || match.bet_type || match.pariType || match.typeOfBet ||
             match.marketType || match.customBet || match.betOption || match.option || null,
  });

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
      betType: null,
    }));
  };

  let matches: Match[] = [];

  if (prediction.matches_data) {
    try {
      const matchesData = JSON.parse(prediction.matches_data);
      if (Array.isArray(matchesData)) {
        matches = matchesData.map((match, index) => normalizeMatch(match, index, prediction));
      } else if (matchesData.lotoNumbers) {
        matches = [{
          id: 'loto-1', teams: 'Loto',
          prediction: `Numéros: ${matchesData.lotoNumbers.join(', ')}`,
          odds: '', league: 'Loto', time: '', betType: 'Loto',
        }];
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
      matches = splitMultipleMatches(prediction.match, prediction.prediction || '', prediction.odds || '');
    } else {
      matches = [{
        id: 'default-1', teams: prediction.match, prediction: prediction.prediction,
        odds: prediction.odds, league: prediction.sport, time: '20:00',
        betType: prediction.betType === 'simple' ? prediction.selectedBetType || null : null,
      }];
    }
  }

  const betTypeLabel = prediction.betType === 'combine' ? 'Pari Combiné' : 'Paris Multiples';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-0 bg-gradient-to-b from-card to-background shadow-2xl">
        {/* Header avec gradient */}
        <DialogHeader className="flex-shrink-0 px-5 pt-5 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30">
          <DialogTitle className="flex flex-col items-start gap-2">
            <span className="text-lg font-bold text-foreground">{betTypeLabel}</span>
            <Badge className="text-xs font-bold bg-primary text-primary-foreground border-0 shadow-sm animate-scale-in">
              ⚡ {matches.length} match{matches.length > 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-5">
            {/* Bannière */}
            <div className="relative overflow-hidden rounded-2xl shadow-md animate-fade-in">
              <img
                src="/lovable-uploads/546931fd-e8a2-4958-9150-8ad8c4308659.png"
                alt="Winner.bet Application"
                className="w-full h-auto"
              />
            </div>

            {/* User info card */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/20 border border-border/20 animate-fade-in"
                 style={{ animationDelay: '0.05s' }}>
              <Avatar className="h-12 w-12 ring-2 ring-primary/30 shadow-md">
                <AvatarImage src={prediction.user.avatar} alt={prediction.user.username} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {prediction.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-bold text-foreground">{prediction.user.username}</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                    ✓ {prediction.successRate}%
                  </span>
                  <span>• {prediction.user.badge}</span>
                </div>
              </div>
            </div>

            {/* Matchs */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">⚡</span>
                Matchs sélectionnés
              </h4>

              <div className="space-y-2.5">
                {matches.map((match, index) => (
                  <div
                    key={match.id || index}
                    className="group relative p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${0.08 * (index + 1)}s` }}
                  >
                    {/* Index indicator */}
                    <div className="absolute -left-0.5 top-4 w-1 h-8 rounded-r-full bg-primary/60 group-hover:h-12 transition-all duration-300" />
                    
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground leading-tight mb-2">{match.teams}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
                            ⚽ {match.league}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
                            ⏰ {match.time}
                          </span>
                          {match.betType && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              🎯 {match.betType}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 font-bold text-xs px-3 py-1.5 whitespace-nowrap shadow-sm shadow-emerald-500/25">
                        {match.prediction}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Côte totale */}
            {prediction.totalOdds && prediction.betType === 'combine' && (
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg animate-fade-in">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span className="font-bold text-white text-sm">Côte totale</span>
                  </div>
                  <span className="text-2xl font-black text-white drop-shadow-sm">
                    {prediction.totalOdds}
                  </span>
                </div>
              </div>
            )}

            {/* Code de réservation */}
            {prediction.reservationCode && (
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white p-5 rounded-2xl text-center shadow-xl animate-scale-in">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative">
                  <div className="text-[10px] font-bold mb-2 opacity-80 uppercase tracking-[0.2em]">Code de réservation</div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-3xl font-black tracking-[0.25em] drop-shadow-sm">
                      {prediction.reservationCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 active:scale-90"
                      title="Copier le code"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  {copied && (
                    <div className="text-[10px] mt-2 font-medium opacity-90 animate-fade-in">✓ Code copié !</div>
                  )}
                </div>
              </div>
            )}

            {/* Analyse */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/40 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center text-sm">💡</span>
                <span className="font-bold text-sky-900 text-sm">Analyse</span>
              </div>
              <p className="text-sky-800 text-sm leading-relaxed">{prediction.analysis}</p>
            </div>

            {/* Confiance */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-amber-200/40 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-sm">🔥</span>
                  <span className="font-bold text-amber-900 text-sm">Confiance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${
                          i < prediction.confidence
                            ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-sm shadow-amber-400/40 scale-100'
                            : 'bg-amber-200/40 scale-90'
                        }`}
                        style={{ transitionDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-amber-700 font-black text-sm">
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
