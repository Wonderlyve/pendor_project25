
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ImageOptimizer } from '@/optimization/ImageOptimizer';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  sport?: string;
  match_teams?: string;
  prediction_text?: string;
  analysis?: string;
  odds: number;
  confidence: number;
  image_url?: string;
  video_url?: string;
  likes: number;
  shares: number;
  views: number;
  created_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  like_count?: number;
  is_liked?: boolean;
  saved_at?: string;
  status?: 'won' | 'lost' | 'pending';
  bet_type?: string;
  matches_data?: string;
  reservation_code?: string;
  post_type?: string;
}

const POSTS_PER_PAGE = 10;

export const useOptimizedPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [lastPostTimestamp, setLastPostTimestamp] = useState<string | null>(null);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  const fetchPosts = useCallback(async (pageNum: number, limit: number = POSTS_PER_PAGE) => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .range(pageNum * limit, (pageNum + 1) * limit - 1);

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Erreur lors du chargement des posts');
        return [];
      }

      const transformedPosts = data?.map((post: any) => ({
        ...post,
        username: post.profiles?.username,
        display_name: post.profiles?.display_name,
        avatar_url: post.profiles?.avatar_url,
        like_count: post.likes
      })) || [];

      // Vérifier les likes de l'utilisateur si connecté
      if (user && transformedPosts.length > 0) {
        const postIds = transformedPosts.map(post => post.id);
        const { data: userLikes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);
        
        transformedPosts.forEach(post => {
          post.is_liked = likedPostIds.has(post.id);
        });
      }

      // Mettre à jour le timestamp du dernier post
      if (transformedPosts.length > 0 && pageNum === 0) {
        setLastPostTimestamp(transformedPosts[0].created_at);
      }

      return transformedPosts;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkForNewPosts = useCallback(async () => {
    if (!lastPostTimestamp) return false;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, created_at')
        .gt('created_at', lastPostTimestamp)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking for new posts:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking for new posts:', error);
      return false;
    }
  }, [lastPostTimestamp]);

  const loadInitialPosts = useCallback(async () => {
    setInitialLoading(true);
    const newPosts = await fetchPosts(0);
    setPosts(newPosts);
    setPage(1);
    setHasMore(newPosts.length === POSTS_PER_PAGE);
    setInitialLoading(false);
  }, [fetchPosts]);

  const refreshPostsIfNeeded = useCallback(async () => {
    const hasNewPosts = await checkForNewPosts();
    if (hasNewPosts) {
      console.log('Nouveaux posts détectés, actualisation...');
      await loadInitialPosts();
    }
  }, [checkForNewPosts, loadInitialPosts]);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    const newPosts = await fetchPosts(page);
    
    if (newPosts.length === 0) {
      setHasMore(false);
    } else {
      setPosts(prev => [...prev, ...newPosts]);
      setPage(prev => prev + 1);
      setHasMore(newPosts.length === POSTS_PER_PAGE);
    }
  }, [fetchPosts, page, loading, hasMore]);

  const uploadOptimizedFile = async (file: File, bucket: string): Promise<string | null> => {
    if (!user) return null;

    try {
      let optimizedFile = file;

      if (file.type.startsWith('image/')) {
        optimizedFile = await ImageOptimizer.compressImage(file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 0.85,
          format: 'webp'
        });
      }

      const fileExt = optimizedFile.type.split('/')[1];
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, optimizedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Erreur lors de l\'upload du fichier');
        return null;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors de l\'upload du fichier');
      return null;
    }
  };

  const createPost = async (postData: {
    sport?: string;
    match_teams?: string;
    prediction_text?: string;
    analysis: string;
    odds: number;
    confidence: number;
    image_file?: File;
    video_file?: File;
    bet_type?: string;
    matches_data?: string;
    reservation_code?: string;
    post_type?: string;
    content?: string;
  }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un post');
      return null;
    }

    try {
      console.log('Début createPost avec données:', postData);
      
      let image_url = null;
      let video_url = null;

      if (postData.image_file) {
        console.log('Upload image...');
        image_url = await uploadOptimizedFile(postData.image_file, 'post-images');
        console.log('Image uploadée:', image_url);
      }

      if (postData.video_file) {
        console.log('Upload vidéo...');
        video_url = await uploadOptimizedFile(postData.video_file, 'post-videos');
        console.log('Vidéo uploadée:', video_url);
      }

      const insertData = {
        user_id: user.id,
        content: postData.content || postData.analysis,
        sport: postData.sport,
        match_teams: postData.match_teams,
        prediction_text: postData.prediction_text,
        analysis: postData.analysis,
        odds: postData.odds,
        confidence: postData.confidence,
        image_url,
        video_url,
        bet_type: postData.bet_type,
        reservation_code: postData.reservation_code,
        post_type: postData.post_type,
        likes: 0,
        shares: 0,
        views: 0
      };

      console.log('Données à insérer:', insertData);

      const { data, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la création du post:', error);
        toast.error(`Erreur lors de la création du post: ${error.message}`);
        return null;
      }

      console.log('Post créé avec succès:', data);
      toast.success('Post créé avec succès !');
      loadInitialPosts();
      return data;
    } catch (error) {
      console.error('Erreur générale:', error);
      toast.error('Erreur lors de la création du post');
      return null;
    }
  };

  const likePost = async (postId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker un post');
      return;
    }

    try {
      // Vérifier si l'utilisateur a déjà liké ce post
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike - supprimer le like
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error unliking post:', deleteError);
          toast.error('Erreur lors du unlike');
          return;
        }

        // Mise à jour locale optimiste
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: Math.max(0, post.likes - 1),
                like_count: Math.max(0, post.like_count! - 1),
                is_liked: false
              }
            : post
        ));
      } else {
        // Like - ajouter le like
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (insertError) {
          console.error('Error liking post:', insertError);
          if (insertError.code === '23505') {
            toast.error('Vous avez déjà liké ce post');
          } else {
            toast.error('Erreur lors du like');
          }
          return;
        }

        // Mise à jour locale optimiste
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: post.likes + 1,
                like_count: post.like_count! + 1,
                is_liked: true
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error in likePost:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  // Écouter les nouveaux posts en temps réel - Simplifié
  useEffect(() => {
    if (!lastPostTimestamp) return;

    // Nettoyer l'ancien canal s'il existe
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel('posts-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        () => {
          // Simplement actualiser la liste quand un nouveau post est détecté
          refreshPostsIfNeeded();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [lastPostTimestamp, refreshPostsIfNeeded]);

  // Vérification périodique pour les nouveaux posts (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPostsIfNeeded();
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [refreshPostsIfNeeded]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + windowHeight >= docHeight * 0.8) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts]);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  return {
    posts,
    loading,
    initialLoading,
    hasMore,
    createPost,
    likePost,
    loadMorePosts,
    refetch: loadInitialPosts
  };
};
