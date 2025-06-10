
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardCardProps {
  rank: number;
  user: {
    name: string;
    avatar: string;
  };
  profit: number;
  winRate: number;
  totalBets: number;
}

const LeaderboardCard = ({ rank, user, profit, winRate, totalBets }: LeaderboardCardProps) => {
  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return null;
    }
  };

  const getRankBadge = () => {
    if (rank <= 3) {
      const colors = {
        1: 'from-yellow-400 to-yellow-600',
        2: 'from-gray-400 to-gray-600',
        3: 'from-amber-400 to-amber-600'
      };
      return `bg-gradient-to-r ${colors[rank as keyof typeof colors]} text-white`;
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 border border-gray-100">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankBadge()}`}>
          {rank <= 3 ? getRankIcon() : rank}
        </div>
        
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-12 h-12 rounded-full border-2 border-gray-200"
        />
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{user.name}</h3>
          <div className="text-sm text-gray-600">{totalBets} paris</div>
        </div>
        
        <div className="text-right">
          <div className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}€{profit}
          </div>
          <div className="text-sm text-gray-600">{winRate}% réussite</div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;
