
import React from 'react';
import { Trophy, User, Bell } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="h-8 w-8 text-yellow-300" />
          <h1 className="text-2xl font-bold">SportBet Social</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-sm font-medium">Solde: €1,250.00</span>
          </div>
          <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <User className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
