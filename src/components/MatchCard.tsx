
import React from 'react';
import { Clock, Users } from 'lucide-react';

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  drawOdds?: string;
  awayOdds: string;
  time: string;
  sport: string;
  league: string;
}

const MatchCard = ({ homeTeam, awayTeam, homeOdds, drawOdds, awayOdds, time, sport, league }: MatchCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{time}</span>
        </div>
        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          {league}
        </div>
      </div>
      
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">{homeTeam}</div>
          </div>
          <div className="text-gray-400 font-bold text-xl">VS</div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">{awayTeam}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105">
          <div className="text-xs opacity-90">1</div>
          <div className="font-bold">{homeOdds}</div>
        </button>
        
        {drawOdds && (
          <button className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105">
            <div className="text-xs opacity-90">X</div>
            <div className="font-bold">{drawOdds}</div>
          </button>
        )}
        
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105">
          <div className="text-xs opacity-90">2</div>
          <div className="font-bold">{awayOdds}</div>
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
