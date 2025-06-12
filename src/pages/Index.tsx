
import { useState } from 'react';
import { Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PredictionCard from '@/components/PredictionCard';
import BottomNavigation from '@/components/BottomNavigation';
import SideMenu from '@/components/SideMenu';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PostSkeleton from '@/optimization/PostSkeleton';

const Index = () => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { posts, loading, initialLoading } = useOptimizedPosts();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.match_teams?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.sport?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  // Transform Post to PredictionCard format
  const transformPostToPrediction = (post: any) => ({
    id: parseInt(post.id),
    user: {
      username: post.display_name || post.username || 'Utilisateur',
      avatar: post.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.user_id,
      badge: post.badge || 'Nouveau',
      badgeColor: post.badge === 'Pro' ? 'bg-purple-500' : post.badge === 'Confirmé' ? 'bg-blue-500' : 'bg-gray-500'
    },
    match: post.match_teams || 'Match non spécifié',
    prediction: post.prediction_text || 'Pronostic non spécifié',
    odds: post.odds?.toString() || '1.00',
    confidence: post.confidence || 0,
    analysis: post.analysis || post.content || '',
    likes: post.likes || 0,
    comments: post.comments || 0,
    shares: post.shares || 0,
    successRate: 75, // Default value, should come from user stats
    timeAgo: new Date(post.created_at).toLocaleDateString('fr-FR'),
    sport: post.sport || 'Sport',
    image: post.image_url,
    video: post.video_url,
    is_liked: post.is_liked || false
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec logo et photo de profil - couleur verte restaurée */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSideMenuOpen(true)}
                className="lg:hidden text-white hover:bg-white/20"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/35ad5651-d83e-4704-9851-61f3ad9fb0c3.png" 
                  alt="PENDOR Logo" 
                  className="w-8 h-8 rounded-full"
                />
                <h1 className="text-xl font-bold text-white">PENDOR</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleProfileClick}
                className="text-white hover:bg-white/20"
              >
                {user ? (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <User className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher des pronostics, sports, équipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20 space-y-4">
        {initialLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery ? 'Aucun pronostic trouvé pour votre recherche.' : 'Aucun pronostic disponible.'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PredictionCard key={post.id} prediction={transformPostToPrediction(post)} />
          ))
        )}

        {loading && (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
      <SideMenu open={sideMenuOpen} onOpenChange={setSideMenuOpen} />
    </div>
  );
};

export default Index;
