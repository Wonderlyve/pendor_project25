
import React from 'react';
import { Calendar, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface BetCardProps {
  match: string;
  odds: string;
  amount: number;
  status: 'active' | 'won' | 'lost';
  sport: string;
  date: string;
  userProfile?: {
    name: string;
    avatar: string;
  };
}

const BetCard = ({ match, odds, amount, status, sport, date, userProfile }: BetCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'won': return 'from-green-500 to-emerald-600';
      case 'lost': return 'from-red-500 to-rose-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'won': return <TrendingUp className="h-5 w-5" />;
      case 'lost': return <TrendingDown className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
      {userProfile && (
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={userProfile.avatar} 
            alt={userProfile.name}
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium text-gray-700">{userProfile.name}</span>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">{match}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{sport}</span>
          </div>
        </div>
        
        <div className={`bg-gradient-to-r ${getStatusColor()} text-white px-3 py-1 rounded-full flex items-center space-x-1`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {status === 'active' ? 'En cours' : status === 'won' ? 'Gagné' : 'Perdu'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">Cote</div>
          <div className="text-xl font-bold text-emerald-600">{odds}</div>
        </div>
        
        <div className="space-y-1 text-right">
          <div className="text-sm text-gray-600">Mise</div>
          <div className="text-xl font-bold">€{amount}</div>
        </div>
        
        <div className="space-y-1 text-right">
          <div className="text-sm text-gray-600">Gain potentiel</div>
          <div className="text-xl font-bold text-green-600">
            €{(amount * parseFloat(odds)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetCard;
