
import { Trophy, Medal, Crown, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardProps {
  currentUserCC: number;
}

const Leaderboard = ({ currentUserCC }: LeaderboardProps) => {
  // Données simulées du classement
  const leaderboardData = [
    { rank: 1, name: "SpeedRacer_92", cc: 487, boost: "+12", trend: "up" },
    { rank: 2, name: "MotoKing", cc: 469, boost: "+8", trend: "up" },
    { rank: 3, name: "RaceQueen_X", cc: 445, boost: "+15", trend: "up" },
    { rank: 4, name: "ThunderRider", cc: 432, boost: "+5", trend: "down" },
    { rank: 5, name: "Vous", cc: currentUserCC, boost: "+7", trend: "up", isUser: true },
    { rank: 6, name: "NightFury_77", cc: 398, boost: "+3", trend: "up" },
    { rank: 7, name: "VelocityX", cc: 387, boost: "-2", trend: "down" },
    { rank: 8, name: "CaisseMaster", cc: 372, boost: "+9", trend: "up" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />;
      default:
        return <Trophy className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Trophy className="w-6 h-6" />
          Classement en Temps Réel
        </CardTitle>
        <p className="text-sm text-gray-400">
          Top 100 qualifiés pour l'achat de moto
        </p>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboardData.map((player) => (
          <div
            key={player.rank}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              player.isUser
                ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/50"
                : "bg-gray-800/50 hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Rank & Icon */}
              <div className="flex items-center gap-2 w-12">
                <span className={`text-sm font-bold ${
                  player.rank <= 3 ? "text-yellow-400" : "text-gray-400"
                }`}>
                  #{player.rank}
                </span>
                {getRankIcon(player.rank)}
              </div>

              {/* Player Name */}
              <div>
                <p className={`font-medium ${
                  player.isUser ? "text-blue-400" : "text-white"
                }`}>
                  {player.name}
                  {player.isUser && <span className="text-xs text-blue-300 ml-1">(Vous)</span>}
                </p>
                {player.rank <= 100 && (
                  <p className="text-xs text-green-400">✓ Qualifié pour moto</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Trend */}
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-3 h-3 ${
                  player.trend === "up" ? "text-green-400" : "text-red-400"
                }`} />
                <span className={`text-xs ${
                  player.boost.startsWith("+") ? "text-green-400" : "text-red-400"
                }`}>
                  {player.boost}
                </span>
              </div>

              {/* CC Count */}
              <div className="text-right">
                <p className="font-bold text-yellow-400">{player.cc} CC</p>
                <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-blue-400 transition-all"
                    style={{ width: `${(player.cc / 500) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      
      {/* Qualification Status */}
      <div className="p-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <p className="text-green-400 font-bold">33</p>
            <p className="text-gray-400">Places restantes</p>
          </div>
          <div>
            <p className="text-blue-400 font-bold">67/100</p>
            <p className="text-gray-400">Qualifiés actuels</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Leaderboard;
