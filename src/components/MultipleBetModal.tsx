import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    matches?: Match[];
  };
}

const MultipleBetModal = ({ open, onOpenChange, prediction }: MultipleBetModalProps) => {
  // Préparer les matchs pour l'affichage
  const matches = prediction.matches ? 
    prediction.matches.map((match, index) => ({
      ...match,
      id: match.id || `match-${index}`,
      betType: match.betType || prediction.betType
    })) :
    [{
      id: "1",
      teams: prediction.match,
      prediction: prediction.prediction,
      odds: prediction.odds,
      league: prediction.sport,
      time: '20:00',
      betType: prediction.betType
    }];

  const isMultipleBet = prediction.betType === 'combine' || prediction.betType === 'multiple' || matches.length > 1;
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
        
        <ScrollArea className="flex-1">
          <div className="space-y-4">
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

            {/* Tableau des matchs optimisé mobile */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {betTypeLabel} ({matches.length} match{matches.length > 1 ? 's' : ''})
              </h4>
              
              <div className="border rounded-lg overflow-hidden">
                {/* Header du tableau */}
                <div className="bg-muted/30 px-3 py-2 border-b">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-5">Équipes</div>
                    <div className="col-span-4">Pronostic</div>
                    <div className="col-span-3 text-center">Côte</div>
                  </div>
                </div>
                
                {/* Corps du tableau */}
                <div className="divide-y">
                  {matches.map((match, index) => (
                    <div key={match.id} className="px-3 py-3">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Équipes */}
                        <div className="col-span-5">
                          <div className="text-sm font-medium text-foreground leading-tight">
                            {match.teams}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {match.league} • {match.time}
                          </div>
                        </div>
                        
                        {/* Pronostic */}
                        <div className="col-span-4">
                          <Badge variant="secondary" className="text-xs mb-1">
                            {match.betType || '1X2'}
                          </Badge>
                          <div className="text-sm font-medium text-foreground">
                            {match.prediction}
                          </div>
                        </div>
                        
                        {/* Côte */}
                        <div className="col-span-3 text-center">
                          <div className="text-sm font-bold text-green-600">
                            {match.odds}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleBetModal;