
import { useState } from 'react';
import { Heart, MessageCircle, Share, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';
import PredictionCard from '@/components/PredictionCard';
import SideMenu from '@/components/SideMenu';
import PostSkeleton from '@/optimization/PostSkeleton';
import useScrollToTop from '@/hooks/useScrollToTop';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  useScrollToTop();
  
  const [activeTab, setActiveTab] = useState('trending');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const { posts, loading, initialLoading, hasMore } = useOptimizedPosts();
  const { user } = useAuth();

  // Convert posts from database to the format expected by PredictionCard
  const convertPostToPrediction = (post: any) => ({
    id: post.id,
    user: {
      username: post.username || '@utilisateur',
      avatar: post.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.user_id,
      badge: post.badge || 'Novice',
      badgeColor: post.badge === 'Pro' ? 'bg-blue-500' : post.badge === 'Confirmé' ? 'bg-yellow-500' : 'bg-green-500'
    },
    match: post.match_teams || post.sport || 'Match',
    prediction: post.prediction_text || 'Pronostic',
    odds: post.odds?.toString() || '1.00',
    confidence: post.confidence || 3,
    analysis: post.analysis || post.content || '',
    likes: post.like_count || post.likes || 0,
    comments: post.comment_count || post.comments || 0,
    shares: post.shares || 0,
    successRate: 75, // Default value, could be calculated
    timeAgo: new Date(post.created_at).toLocaleDateString(),
    sport: post.sport || 'Sport',
    image: post.image_url,
    video: post.video_url
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/35ad5651-d83e-4704-9851-61f3ad9fb0c3.png"
                alt="Logo"
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-bold text-white">PENDOR</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
                <span className="text-white text-xl">🔔</span>
              </button>
              {user ? (
                <img
                  src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
              )}
              <button 
                onClick={() => setShowSideMenu(true)}
                className="text-white hover:bg-green-700 p-1 rounded"
              >
                <span className="text-xl">☰</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'trending'
                ? 'text-primary border-b-2 border-primary bg-blue-50'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            🔥 Tendances
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'following'
                ? 'text-primary border-b-2 border-primary bg-blue-50'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            👥 Abonnements
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors relative ${
              activeTab === 'live'
                ? 'text-primary border-b-2 border-primary bg-blue-50'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            🔴 Live
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2 space-y-4">
        {activeTab === 'trending' && (
          <>
            {/* Quick Stats */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Meilleurs pronostiqueurs</h3>
                    <p className="text-sm opacity-90">Cette semaine</p>
                  </div>
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="flex space-x-4 mt-3">
                  <div className="text-center">
                    <div className="font-bold text-lg">86%</div>
                    <div className="text-xs opacity-80">Taux moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{posts.length}</div>
                    <div className="text-xs opacity-80">Pronos actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">34</div>
                    <div className="text-xs opacity-80">Lives en cours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictions Feed */}
            <div className="space-y-4">
              {initialLoading ? (
                // Show skeleton loaders during initial loading
                <>
                  {[...Array(5)].map((_, index) => (
                    <PostSkeleton key={index} />
                  ))}
                </>
              ) : posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <PredictionCard key={post.id} prediction={convertPostToPrediction(post)} />
                  ))}
                  
                  {/* Loading indicator for more posts */}
                  {loading && hasMore && (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <PostSkeleton key={`loading-${index}`} />
                      ))}
                    </div>
                  )}
                  
                  {/* End of posts message */}
                  {!hasMore && posts.length > 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-sm">
                        🎯 Vous avez vu tous les pronostics !
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <TrendingUp className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun pronostic</h3>
                  <p className="text-gray-500 mb-4">Soyez le premier à partager un pronostic !</p>
                  <Button>Créer un pronostic</Button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'following' && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun abonnement</h3>
            <p className="text-gray-500 mb-4">Suivez des pronostiqueurs pour voir leurs analyses ici</p>
            <Button>Découvrir des experts</Button>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-2xl">🔴</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun live en cours</h3>
            <p className="text-gray-500 mb-4">Les pronostiqueurs experts partageront bientôt leurs analyses en direct</p>
            <Button variant="outline">Voir les replays</Button>
          </div>
        )}
      </div>

      <BottomNavigation />
      <SideMenu open={showSideMenu} onOpenChange={setShowSideMenu} />
    </div>
  );
};

export default Index;
