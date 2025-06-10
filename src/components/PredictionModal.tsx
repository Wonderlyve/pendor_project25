
import { Calendar, Clock, Trophy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PredictionModalProps {
  prediction: {
    id: number;
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
    matches?: Array<{
      id: number;
      teams: string;
      prediction: string;
      odds: string;
      league: string;
      time: string;
    }>;
  };
}

const PredictionModal = ({ prediction }: PredictionModalProps) => {
  // Si c'est un pari multiple, afficher tous les matchs
  const matches = prediction.matches || [
    {
      id: 1,
      teams: prediction.match,
      prediction: prediction.prediction,
      odds: prediction.odds,
      league: prediction.sport,
      time: '20:00'
    }
  ];

  const isMultipleBet = matches.length > 1;

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

        {/* Cote totale si pari multiple */}
        {prediction.totalOdds && isMultipleBet && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-orange-800 text-sm">🎯 Pari Combiné</span>
                <div className="text-xs text-orange-600 mt-1">{matches.length} matchs sélectionnés</div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-orange-600">
                  Cote: {prediction.totalOdds}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Liste des matchs avec disposition optimisée */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-800 text-sm">
              {isMultipleBet ? 'Matchs du combiné' : 'Match sélectionné'}
            </span>
          </div>
          
          {matches.map((match, index) => (
            <div key={match.id} className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
              {/* En-tête du match */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-medium text-gray-900 text-sm leading-tight">
                    {match.teams}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{match.league}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{match.time}</span>
                    </div>
                  </div>
                </div>
                
                {/* Cote individuelle */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs text-gray-500 mb-1">Cote</div>
                  <div className="font-bold text-blue-600 text-sm">{match.odds}</div>
                </div>
              </div>
              
              {/* Prédiction */}
              <div className="mt-2">
                <div className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  <span className="mr-1">⚽</span>
                  {match.prediction}
                </div>
              </div>
            </div>
          ))}
        </div>

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
            <span className="font-medium text-yellow-800 text-sm">🔥 Niveau de confiance</span>
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
