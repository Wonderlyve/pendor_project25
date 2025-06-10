
import React, { useState } from 'react';
import { Home, TrendingUp, Users, Trophy, User } from 'lucide-react';

const Navigation = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'bets', label: 'Mes Paris', icon: TrendingUp },
    { id: 'social', label: 'Communauté', icon: Users },
    { id: 'leaderboard', label: 'Classements', icon: Trophy },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-emerald-600' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
