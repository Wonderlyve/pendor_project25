
import { Calendar, Clock, Trophy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    }>;
  };
}

const PredictionModal = ({ prediction }: PredictionModalProps) => {
  // Si c'est un pari multiple, afficher tous les matchs
  const matches = prediction.matches || [
    {
      id: "1",
      teams: prediction.match,
      prediction: prediction.prediction,
      odds: prediction.odds,
      league: prediction.sport,
      time: '20:00'
    }
  ];

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

        {/* Titre avec icône pour les paris combinés */}
        {isMultipleBet && (
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">Match sélectionné</span>
          </div>
        )}

        {/* Liste des matchs avec style similaire à l'image */}
        <div className="space-y-3">
          {matches.map((match, index) => (
            <div key={match.id} className="bg-white border-l-4 border-l-blue-500 p-4 shadow-sm">
              {/* En-tête du match avec cote à droite */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base mb-2">
                    {match.teams}
                  </div>
                  
                  {/* Détails du match */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{match.league}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{match.time}</span>
                    </div>
                  </div>
                  
                  {/* Prédiction avec style vert */}
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 text-lg">⚽</span>
                    <span className="text-green-600 font-medium">{match.prediction}</span>
                  </div>
                </div>
                
                {/* Cote à droite */}
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 mb-1">Cote</div>
                  <div className="font-bold text-blue-600 text-2xl">{match.odds}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Code de réservation - toujours affiché s'il existe */}
        {prediction.reservationCode && (
          <div className="bg-green-500 text-white p-4 rounded-lg text-center">
            <div className="text-sm font-medium mb-1">CODE DE RÉSERVATION</div>
            <div className="text-xl font-bold tracking-widest">
              {prediction.reservationCode}
            </div>
          </div>
        )}

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
