
import { Calendar, Clock, Trophy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface PredictionModalProps {
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
    matches?: Array<{
      id: string;
      teams: string;
      prediction: string;
      odds: string;
      league: string;
      time: string;
      betType?: string;
    }>;
  };
}

const PredictionModal = ({ prediction }: PredictionModalProps) => {
  // Traiter chaque match individuellement - créer un tableau où chaque match est un élément séparé
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

  const isMultipleBet = prediction.betType === 'combine' || matches.length > 1;

  return (
    <ScrollArea className="max-h-[80vh] pr-4">
      <div className="space-y-4">
        {/* Header avec info utilisateur */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <img
            src={prediction.user.avatar}
            alt={prediction.user.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="font-medium text-sm">{prediction.user.username}</div>
            <div className="text-xs text-gray-500">
              {prediction.successRate}% de réussite • Badge {prediction.user.badge}
            </div>
          </div>
        </div>

        {/* Titre Match sélectionné */}
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">Match sélectionné</span>
        </div>

        {/* Liste des matchs sélectionnés */}
        {matches.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Matchs sélectionnés ({matches.length}):</h5>
            <div className="space-y-2">
              {matches.map((match) => (
                <Card key={match.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{match.teams}</div>
                        <div className="text-xs text-gray-500">
                          {match.league} • {match.time}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {match.betType || '1X2'}
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
          </div>
        )}
        
        {/* Total des côtes pour pari combiné */}
        {prediction.totalOdds && isMultipleBet && (
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

        {/* Code de réservation - toujours affiché s'il existe */}
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
  );
};

export default PredictionModal;
