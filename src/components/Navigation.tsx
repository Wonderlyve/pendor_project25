
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, User, Car, CreditCard, Clock, Star } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: MapPin, label: 'Accueil', roles: ['passenger', 'driver'] },
    { path: '/profile', icon: User, label: 'Profil', roles: ['passenger', 'driver'] },
    { path: '/rides', icon: Car, label: 'Mes courses', roles: ['passenger'] },
    { path: '/driver', icon: Car, label: 'Mode chauffeur', roles: ['driver'] },
    { path: '/payment', icon: CreditCard, label: 'Paiement', roles: ['passenger'] },
    { path: '/history', icon: Clock, label: 'Historique', roles: ['passenger', 'driver'] },
    { path: '/ratings', icon: Star, label: 'Évaluations', roles: ['passenger', 'driver'] }
  ];

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          AUTOCOP
        </Link>
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-yellow-500 text-slate-900'
                  : 'hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
