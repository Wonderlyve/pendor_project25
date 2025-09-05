import { useState, useEffect, useCallback } from 'react';
import { FeedSelector } from './FeedSelector';
import { PostActions } from './PostActions';
import { useClassement, ScoredPost } from '@/hooks/useClassement';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const SmartFeedContainer = () => {
  const [currentFeed, setCurrentFeed] = useState<'personalized' | 'community' | 'new'>('community');
  const [posts, setPosts] = useState<ScoredPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useAuth();
  const {
    getPersonalizedFeed,
    getCommunityFeed,
    getNewPredictions,
    toggleBoostPost,
    reportPost,
    loading: hookLoading
  } = useClassement();

  const loadPosts = useCallback(async (feedType: typeof currentFeed, newOffset = 0, append = false) => {
    if (!append) setLoading(true);
    
    try {
      let newPosts: ScoredPost[] = [];
      
      switch (feedType) {
        case 'personalized':
          newPosts = await getPersonalizedFeed(20, newOffset);
          break;
        case 'community':
          newPosts = await getCommunityFeed(20, newOffset, '24h');
          break;
        case 'new':
          newPosts = await getNewPredictions(20, newOffset);
          break;
      }

      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(newPosts.length === 20);
      setOffset(newOffset + newPosts.length);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [getPersonalizedFeed, getCommunityFeed, getNewPredictions]);

  const handleFeedChange = useCallback((feed: typeof currentFeed) => {
    setCurrentFeed(feed);
    setOffset(0);
    setHasMore(true);
    loadPosts(feed, 0, false);
  }, [loadPosts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setOffset(0);
    await loadPosts(currentFeed, 0, false);
    setRefreshing(false);
  }, [currentFeed, loadPosts]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !hookLoading) {
      loadPosts(currentFeed, offset, true);
    }
  }, [currentFeed, offset, hasMore, loading, hookLoading, loadPosts]);

  const handleBoost = useCallback(async (postId: string, currentlyBoosted: boolean) => {
    const success = await toggleBoostPost(postId, currentlyBoosted);
    if (success) {
      // Mettre à jour le post localement
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_boosted: !currentlyBoosted,
              boost_count: currentlyBoosted ? Math.max(0, (post.boost_count || 0) - 1) : (post.boost_count || 0) + 1
            }
          : post
      ));
    }
    return success;
  }, [toggleBoostPost]);

  const handleReport = useCallback(async (postId: string, reason: string, description?: string) => {
    return await reportPost(postId, reason, description);
  }, [reportPost]);

  useEffect(() => {
    loadPosts(currentFeed);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sélecteur de feed */}
      <FeedSelector 
        currentFeed={currentFeed}
        onFeedChange={handleFeedChange}
        isAuthenticated={!!user}
      />

      {/* Bouton de rafraîchissement */}
      <div className="p-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Liste des posts */}
      <div className="space-y-6 p-4">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <Card key={post.id} className="w-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src={post.avatar_url || ''} />
                    <AvatarFallback>
                      {post.display_name?.[0] || post.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {post.display_name || post.username || 'Utilisateur'}
                      </h3>
                      {post.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {post.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {post.match_time && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(post.match_time).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Badge>
                    )}
                    {post.odds && (
                      <span className="text-sm font-bold text-primary">
                        @{post.odds}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Contenu du post */}
                  <div className="space-y-4">
                    {post.sport && post.match_teams && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{post.sport}</Badge>
                        <span className="font-medium">{post.match_teams}</span>
                      </div>
                    )}

                    {post.prediction_text && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-1">Pronostic :</h4>
                        <p className="text-sm">{post.prediction_text}</p>
                      </div>
                    )}

                    {post.analysis && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Analyse :</h4>
                        <p className="text-sm leading-relaxed">{post.analysis}</p>
                      </div>
                    )}

                    {post.image_url && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={post.image_url} 
                          alt="Image du post"
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {post.confidence && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confiance :</span>
                        <Badge variant={post.confidence >= 80 ? "default" : post.confidence >= 60 ? "secondary" : "outline"}>
                          {post.confidence}%
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions du post */}
                  <PostActions
                    postId={post.id}
                    isOwner={post.user_id === user?.id}
                    isBoosted={post.is_boosted || false}
                    boostCount={post.boost_count || 0}
                    visibilityScore={post.visibility_score || post.community_score || post.personalized_score}
                    onBoost={() => handleBoost(post.id, post.is_boosted || false)}
                    onReport={(reason, description) => handleReport(post.id, reason, description)}
                  />
                </CardContent>
              </Card>
            ))}

            {/* Bouton pour charger plus */}
            {hasMore && posts.length > 0 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading || hookLoading}
                >
                  {loading || hookLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    'Charger plus'
                  )}
                </Button>
              </div>
            )}

            {posts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Aucun post trouvé pour ce feed.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};