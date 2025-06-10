
import React from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import BetCard from '../components/BetCard';
import StatsCard from '../components/StatsCard';
import MatchCard from '../components/MatchCard';
import LeaderboardCard from '../components/LeaderboardCard';
import { Plus, Filter, Search } from 'lucide-react';

const Index = () => {
  // Données de démonstration
  const socialBets = [
    {
      match: "PSG vs Marseille",
      odds: "2.10",
      amount: 50,
      status: "active" as const,
      sport: "Football",
      date: "Aujourd'hui 21:00",
      userProfile: {
        name: "Alex Martin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      }
    },
    {
      match: "Lakers vs Warriors",
      odds: "1.85",
      amount: 100,
      status: "won" as const,
      sport: "Basketball",
      date: "Hier 22:30",
      userProfile: {
        name: "Sophie Dubois",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b278?w=40&h=40&fit=crop&crop=face"
      }
    }
  ];

  const stats = [
    { title: "Profit Total", value: "€1,250", change: "+12%", trend: "up" as const, icon: "money" as const },
    { title: "Taux de Réussite", value: "68%", change: "+5%", trend: "up" as const, icon: "target" as const },
    { title: "Paris Actifs", value: "8", change: "+2", trend: "up" as const, icon: "up" as const },
    { title: "Cette Semaine", value: "€340", change: "+€120", trend: "up" as const, icon: "money" as const }
  ];

  const upcomingMatches = [
    {
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      homeOdds: "2.40",
      drawOdds: "3.20",
      awayOdds: "2.80",
      time: "Dim 21:00",
      sport: "Football",
      league: "La Liga"
    },
    {
      homeTeam: "Manchester City",
      awayTeam: "Liverpool",
      homeOdds: "1.95",
      drawOdds: "3.60",
      awayOdds: "3.80",
      time: "Sam 17:30",
      sport: "Football",
      league: "Premier League"
    }
  ];

  const leaderboard = [
    {
      rank: 1,
      user: { name: "Pierre Laurent", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
      profit: 2450,
      winRate: 72,
      totalBets: 156
    },
    {
      rank: 2,
      user: { name: "Marie Rousseau", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
      profit: 1890,
      winRate: 69,
      totalBets: 134
    },
    {
      rank: 3,
      user: { name: "Thomas Petit", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" },
      profit: 1650,
      winRate: 65,
      totalBets: 128
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto p-4 pb-20">
        {/* Section Statistiques */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Feed Social */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Feed Social</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {socialBets.map((bet, index) => (
                  <BetCard key={index} {...bet} />
                ))}
              </div>
            </section>

            {/* Matchs à Venir */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Matchs Populaires</h2>
                <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nouveau Pari</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Classement */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6">🏆 Top Parieurs</h2>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <LeaderboardCard key={entry.rank} {...entry} />
                ))}
              </div>
            </section>

            {/* Widget Promotion */}
            <section>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">🎯 Défi de la Semaine</h3>
                <p className="text-sm opacity-90 mb-4">
                  Gagnez 5 paris consécutifs pour débloquer un bonus de €100 !
                </p>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div className="bg-white rounded-full h-2 w-3/5"></div>
                </div>
                <p className="text-xs opacity-80">3/5 paris réussis</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  );
};

export default Index;
