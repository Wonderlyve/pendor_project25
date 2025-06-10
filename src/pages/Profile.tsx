import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon, Edit, TrendingUp, Users, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import PredictionCard from '@/components/PredictionCard';
import BottomNavigation from '@/components/BottomNavigation';
import useScrollToTop from '@/hooks/useScrollToTop';

const Profile = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock user data
  const user = {
    username: 'PronoExpert',
    fullName: 'Alexandre Martin',
    bio: 'Pronostiqueur expert en football ⚽ | Taux de réussite 86% 📈 | Analyses quotidiennes 💪',
    location: 'Paris, France',
    website: 'pronoexpert.com',
    joinDate: 'Novembre 2023',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=200&fit=crop',
    stats: {
      predictions: 247,
      followers: 1543,
      following: 89,
      successRate: 86
    }
  };

  const userPredictions = [
    {
      id: 1,
      user: {
        username: '@pronoexpert',
        avatar: user.avatar,
        badge: 'Pro',
        badgeColor: 'bg-blue-500'
      },
      match: 'PSG vs Real Madrid',
      prediction: 'Victoire PSG',
      odds: '2.10',
      confidence: 4,
      analysis: 'PSG en forme à domicile, Mbappé en grande forme.',
      likes: 127,
      comments: 23,
      shares: 8,
      successRate: 86,
      timeAgo: '2h',
      sport: 'Football',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">{user.fullName}</h1>
            <p className="text-sm text-gray-500">{user.stats.predictions} pronostics</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative">
        <div 
          className="h-48 bg-gradient-to-r from-green-500 to-blue-600 bg-cover bg-center"
          style={{ backgroundImage: `url(${user.coverImage})` }}
        />
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="w-32 h-32 bg-white p-1 rounded-full">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={() => setIsFollowing(!isFollowing)}
              className={isFollowing ? "" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"}
            >
              {isFollowing ? 'Suivi' : 'Suivre'}
            </Button>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold">{user.fullName}</h2>
              <p className="text-gray-600">@{user.username.toLowerCase()}</p>
            </div>

            <p className="text-gray-900">{user.bio}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <LinkIcon className="w-4 h-4" />
                <span className="text-blue-600">{user.website}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Rejoint en {user.joinDate}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 py-3">
              <div className="text-center">
                <div className="font-bold text-lg">{user.stats.predictions}</div>
                <div className="text-xs text-gray-500">Pronostics</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{user.stats.followers}</div>
                <div className="text-xs text-gray-500">Abonnés</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{user.stats.following}</div>
                <div className="text-xs text-gray-500">Abonnements</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">{user.stats.successRate}%</div>
                <div className="text-xs text-gray-500">Réussite</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold text-lg">86%</div>
              <div className="text-xs opacity-90">Taux de réussite</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold text-lg">Top 5%</div>
              <div className="text-xs opacity-90">Classement</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4">
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">Pronostics</TabsTrigger>
            <TabsTrigger value="wins">Gagnants</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predictions" className="space-y-4 mt-4">
            {userPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </TabsContent>
          
          <TabsContent value="wins" className="text-center py-12">
            <Star className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Pronostics gagnants</h3>
            <p className="text-gray-500">Vos meilleurs pronostics apparaîtront ici</p>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Statistiques détaillées</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total pronostics</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pronostics gagnants</span>
                    <span className="font-medium text-green-600">212</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pronostics perdants</span>
                    <span className="font-medium text-red-600">35</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI moyen</span>
                    <span className="font-medium text-green-600">+24%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
