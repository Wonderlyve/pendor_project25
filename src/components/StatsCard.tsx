
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: 'money' | 'target' | 'up' | 'down';
}

const StatsCard = ({ title, value, change, trend, icon }: StatsCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'money': return <DollarSign className="h-6 w-6" />;
      case 'target': return <Target className="h-6 w-6" />;
      case 'up': return <TrendingUp className="h-6 w-6" />;
      case 'down': return <TrendingDown className="h-6 w-6" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-3 rounded-lg text-white">
          {getIcon()}
        </div>
        <span className={`text-sm font-medium ${getTrendColor()}`}>
          {change}
        </span>
      </div>
      
      <div>
        <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
