
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

  return (
    <ScrollArea className="max-h-[80vh] pr-4">
      <div className="space-y-3">
        {/* Header avec info utilisateur */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <img
            src={prediction.user.avatar}
            alt={prediction.user.username}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="font-medium text-sm">{prediction.user.username}</div>
            <div className="text-xs text-gray-500">
              {prediction.successRate}% de réussite • Badge {prediction.user.badge}
            </div>
          </div>
        </div>

        {/* Cote totale si pari multiple */}
        {prediction.totalOdds && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-orange-800 text-sm">Pari Combiné</span>
              <span className="text-base font-bold text-orange-600">
                Cote totale: {prediction.totalOdds}
              </span>
            </div>
          </div>
        )}

        {/* Liste des matchs */}
        <div className="space-y-2">
          {matches.map((match, index) => (
            <div key={match.id} className="border rounded-lg p-2 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{match.teams}</div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <Trophy className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{match.league}</span>
                    <Clock className="w-3 h-3 flex-shrink-0 ml-1" />
                    <span>{match.time}</span>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="text-xs text-gray-500">Cote</div>
                  <div className="font-bold text-blue-600 text-sm">{match.odds}</div>
                </div>
              </div>
              
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium inline-block">
                {match.prediction}
              </div>
            </div>
          ))}
        </div>

        {/* Analyse */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="font-medium text-blue-900 mb-2 text-sm">💡 Analyse</div>
          <p className="text-blue-800 text-sm leading-relaxed">{prediction.analysis}</p>
        </div>

        {/* Niveau de confiance */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-yellow-800 text-sm">Niveau de confiance</span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < prediction.confidence ? 'bg-yellow-400' : 'bg-yellow-200'
                  }`}
                />
              ))}
              <span className="ml-2 text-yellow-700 font-medium text-sm">
                {prediction.confidence}/5
                {prediction.confidence === 5 ? ' 🔥🔥' : prediction.confidence >= 4 ? ' 🔥' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default PredictionModal;
