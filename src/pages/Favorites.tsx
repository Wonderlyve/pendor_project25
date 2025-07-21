
import { useState, useEffect } from 'react';
import { Heart, Calendar, TrendingUp, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/hooks/useOptimizedPosts';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      // Stub for favorites - return empty array for now
      setFavorites([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold">Mes Favoris</h1>
            <Badge variant="secondary">{favorites.length}</Badge>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="max-w-2xl mx-auto p-4">
        {favorites.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun favori
            </h3>
            <p className="text-gray-500">
              Vous n'avez pas encore sauvegardé de pronostics.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((post) => (
              <Card key={post.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Header with user info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {post.display_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{post.display_name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Sauvé le {post.saved_at ? formatDate(post.saved_at) : formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {post.status && (
                      <Badge className={getStatusColor(post.status)}>
                        {post.status === 'won' ? 'Gagné' : 
                         post.status === 'lost' ? 'Perdu' : 'En cours'}
                      </Badge>
                    )}
                  </div>

                  {/* Match info */}
                  {post.match_teams && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{post.match_teams}</p>
                          {post.sport && (
                            <p className="text-xs text-gray-500">{post.sport}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">{post.odds}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Star className="w-3 h-3" />
                            <span>{post.confidence}% confiance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prediction */}
                  {post.prediction_text && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">
                        Pronostic: {post.prediction_text}
                      </p>
                    </div>
                  )}

                  {/* Analysis */}
                  {post.analysis && (
                    <div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {post.analysis}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.like_count || post.likes || 0} likes</span>
                      <span>0 commentaires</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
