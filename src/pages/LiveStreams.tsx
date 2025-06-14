
import { useState } from 'react';
import { Play, Plus, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BottomNavigation from '@/components/BottomNavigation';

const LiveStreams = () => {
  const navigate = useNavigate();
  
  // Mock data pour les lives
  const [liveStreams] = useState([
    {
      id: 1,
      streamer: "ProBettor_92",
      title: "PSG vs Real - Analyse en direct 🔥",
      viewers: 1234,
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop",
      isLive: true
    },
    {
      id: 2,
      streamer: "FootballExpert",
      title: "Pronos Ligue 1 - Session questions/réponses",
      viewers: 856,
      thumbnail: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop",
      isLive: true
    },
    {
      id: 3,
      streamer: "BetMaster",
      title: "Stratégies de paris sportifs",
      viewers: 432,
      thumbnail: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=600&fit=crop",
      isLive: true
    },
    {
      id: 4,
      streamer: "SportAnalyst",
      title: "Champions League Preview",
      viewers: 2156,
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop",
      isLive: true
    },
    {
      id: 5,
      streamer: "LiveBets_Pro",
      title: "Session de paris en live",
      viewers: 678,
      thumbnail: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop",
      isLive: true
    },
    {
      id: 6,
      streamer: "TipsterKing",
      title: "Mes pronos du week-end",
      viewers: 923,
      thumbnail: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=600&fit=crop",
      isLive: true
    }
  ]);

  const joinLive = (liveId: number) => {
    navigate(`/live/${liveId}`);
  };

  const startLive = () => {
    // Logic pour démarrer un live
    console.log("Démarrer un live");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Lives</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>{liveStreams.filter(l => l.isLive).length} en direct</span>
          </div>
        </div>
      </div>

      {/* Lives Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {liveStreams.map((live) => (
            <Card key={live.id} className="overflow-hidden border-0 shadow-sm">
              <div className="relative">
                {/* Thumbnail with 2:3 aspect ratio */}
                <div className="relative aspect-[2/3] bg-gray-200">
                  <img
                    src={live.thumbnail}
                    alt={live.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Live indicator */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </div>
                  {/* Viewer count */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {live.viewers.toLocaleString()}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                    {live.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{live.streamer}</p>
                  
                  <Button
                    onClick={() => joinLive(live.id)}
                    size="sm"
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Rejoindre
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Start Live Button */}
      <Button
        onClick={startLive}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg z-20"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <BottomNavigation />
    </div>
  );
};

export default LiveStreams;
