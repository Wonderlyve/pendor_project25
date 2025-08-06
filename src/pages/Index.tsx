
import { useState, useEffect } from 'react';
import { Menu, Search, User, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PredictionCard from '@/components/PredictionCard';
import BottomNavigation from '@/components/BottomNavigation';
import SideMenu from '@/components/SideMenu';
import NotificationIcon from '@/components/NotificationIcon';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import PostSkeleton from '@/optimization/PostSkeleton';
import { supabase } from '@/integrations/supabase/client';
import UpdateNotificationPost from '@/components/UpdateNotificationPost';

const Index = () => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [minOdds, setMinOdds] = useState<string>('');
  const [maxOdds, setMaxOdds] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const { posts, loading, initialLoading } = useOptimizedPosts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Gérer l'affichage d'un post spécifique depuis une notification
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  // Charger les posts masqués et utilisateurs bloqués
  useEffect(() => {
    const loadUserFilters = async () => {
      if (!user) {
        setHiddenPostIds([]);
        setBlockedUserIds([]);
        return;
      }

      try {
        // Charger les posts masqués
        const { data: hiddenPosts } = await supabase
          .from('hidden_posts')
          .select('post_id')
          .eq('user_id', user.id);

        // Charger les utilisateurs bloqués
        const { data: blockedUsers } = await supabase
          .from('blocked_users')
          .select('blocked_id')
          .eq('blocker_id', user.id);

        setHiddenPostIds(hiddenPosts?.map(hp => hp.post_id) || []);
        setBlockedUserIds(blockedUsers?.map(bu => bu.blocked_id) || []);
      } catch (error) {
        console.error('Error loading user filters:', error);
      }
    };

    loadUserFilters();
  }, [user]);

  // Gérer le paramètre post dans l'URL pour les notifications
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const postId = searchParams.get('post');
    
    if (postId) {
      setHighlightedPostId(postId);
      
      // Faire défiler vers le post après un court délai
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      
      // Enlever le surlignage après 3 secondes
      setTimeout(() => {
        setHighlightedPostId(null);
        // Nettoyer l'URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 3000);
    }
  }, [location.search]);

  const handleOpenModal = (data: any) => {
    // Modal handling logic if needed
    console.log('Opening modal with data:', data);
  };

  const filteredPosts = posts.filter(post => {
    // Filtrer par recherche (contenu, équipes, sport, et nom d'utilisateur)
    const matchesSearch = searchQuery === '' || 
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.match_teams?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filtrer par sport
    if (selectedSport && selectedSport !== '' && selectedSport !== 'all' && post.sport !== selectedSport) return false;

    // Filtrer par cotes - vérifier que les valeurs sont valides
    const postOdds = parseFloat(post.odds?.toString() || '0');
    if (minOdds && minOdds !== '' && !isNaN(parseFloat(minOdds))) {
      if (postOdds < parseFloat(minOdds)) return false;
    }
    if (maxOdds && maxOdds !== '' && !isNaN(parseFloat(maxOdds))) {
      if (postOdds > parseFloat(maxOdds)) return false;
    }

    // Filtrer les posts masqués
    if (hiddenPostIds.includes(post.id)) return false;

    // Filtrer les posts d'utilisateurs bloqués
    if (blockedUserIds.includes(post.user_id)) return false;

    return true;
  });

  // Obtenir la liste unique des sports pour le filtre
  const uniqueSports = Array.from(new Set(posts.map(post => post.sport).filter(Boolean)));

  const clearFilters = () => {
    setSelectedSport('');
    setMinOdds('');
    setMaxOdds('');
    setSearchQuery('');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  // Transform Post to PredictionCard format
  const transformPostToPrediction = (post: any) => {
    // Déterminer les données utilisateur à afficher
    const hasCustomUsername = post.custom_username && post.custom_username !== 'Smart';
    const displayUsername = hasCustomUsername ? post.custom_username : (post.display_name || post.username || 'Utilisateur');
    const displayAvatar = post.avatar_url || (hasCustomUsername ? 
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.custom_username}` : 
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`);
    const displayBadge = post.badge || (hasCustomUsername ? 'Pro' : 'Nouveau');
    const badgeColor = post.badge ? 'bg-blue-500' : (hasCustomUsername ? 'bg-blue-500' : 'bg-gray-500');

    return {
    id: post.id,
    user_id: post.user_id, // Ajout du user_id pour la détection du propriétaire
    user: {
      username: displayUsername,
      avatar: displayAvatar,
      badge: displayBadge,
      badgeColor: badgeColor
    },
    match: post.match_teams || 'Match non spécifié',
    prediction: post.prediction_text || 'Pronostic non spécifié',
    odds: post.odds?.toString() || '1.00',
    confidence: post.confidence || 0,
    analysis: post.analysis || post.content || '',
    likes: post.likes || 0,
    comments: post.comments || 0,
    shares: post.shares || 0,
    views: post.views || 0,
    successRate: 75, // Default value, should come from user stats
    timeAgo: new Date(post.created_at).toLocaleDateString('fr-FR'),
    sport: post.sport || 'Sport',
    image: post.image_url,
    video: post.video_url,
    reservationCode: post.reservation_code,
    betType: post.bet_type,
    is_liked: post.is_liked || false
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec logo, notifications et photo de profil */}
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
              {user && <NotificationIcon />}
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

      {/* Search Bar et Filtres - Fixe */}
      <div className="bg-white border-b sticky top-[73px] z-30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par pronostic, sport, équipe, utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary text-white' : ''}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Sport</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Tous les sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les sports</SelectItem>
                      {uniqueSports.map(sport => (
                        <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Cote min</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 1.5"
                    value={minOdds}
                    onChange={(e) => setMinOdds(e.target.value)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Cote max</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5.0"
                    value={maxOdds}
                    onChange={(e) => setMaxOdds(e.target.value)}
                    className="h-8"
                  />
                </div>
                
                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Effacer les filtres
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20 space-y-4">
        {/* Update Notification Post */}
        <UpdateNotificationPost />
        
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
            <div 
              key={post.id} 
              id={`post-${post.id}`}
              className={`transition-all duration-1000 ${
                highlightedPostId === post.id 
                  ? 'ring-2 ring-blue-500 ring-opacity-75 shadow-lg' 
                  : ''
              }`}
            >
              <PredictionCard 
                prediction={transformPostToPrediction(post)} 
                onOpenModal={handleOpenModal}
              />
            </div>
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
