
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
  comments: number;
  shares: number;
  created_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  badge?: string;
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
  saved_at?: string;
  status?: 'won' | 'lost' | 'pending';
}

const POSTS_PER_PAGE = 10;

export const useOptimizedPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
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
            avatar_url,
            badge
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
        badge: post.profiles?.badge,
        like_count: post.likes,
        comment_count: post.comments
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

      return transformedPosts;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadInitialPosts = useCallback(async () => {
    setInitialLoading(true);
    const newPosts = await fetchPosts(0);
    setPosts(newPosts);
    setPage(1);
    setHasMore(newPosts.length === POSTS_PER_PAGE);
    setInitialLoading(false);
  }, [fetchPosts]);

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
  }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un post');
      return null;
    }

    try {
      let image_url = null;
      let video_url = null;

      if (postData.image_file) {
        image_url = await uploadOptimizedFile(postData.image_file, 'post-images');
      }

      if (postData.video_file) {
        video_url = await uploadOptimizedFile(postData.video_file, 'post-videos');
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.analysis,
          sport: postData.sport,
          match_teams: postData.match_teams,
          prediction_text: postData.prediction_text,
          analysis: postData.analysis,
          odds: postData.odds,
          confidence: postData.confidence,
          image_url,
          video_url,
          likes: 0,
          comments: 0,
          shares: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast.error('Erreur lors de la création du post');
        return null;
      }

      toast.success('Post créé avec succès !');
      loadInitialPosts();
      return data;
    } catch (error) {
      console.error('Error:', error);
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
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unliking post:', error);
          // Si l'erreur est due à la contrainte unique, l'utilisateur a déjà liké
          if (error.code === '23505') {
            toast.error('Vous avez déjà liké ce post');
          }
          return;
        }

        // Mise à jour locale optimiste
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: post.likes - 1,
                like_count: post.like_count! - 1,
                is_liked: false
              }
            : post
        ));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          console.error('Error liking post:', error);
          // Si l'erreur est due à la contrainte unique, l'utilisateur a déjà liké
          if (error.code === '23505') {
            toast.error('Vous avez déjà liké ce post');
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
      console.error('Error:', error);
    }
  };

  // Écouter les mises à jour en temps réel des posts avec un contrôle strict
  useEffect(() => {
    // Nettoyer l'ancien canal s'il existe
    if (channelRef.current) {
      console.log('Cleaning up existing posts channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Créer un nouveau canal avec un identifiant unique
    const sessionId = Math.random().toString(36).substring(2, 15);
    const channelName = `posts-changes-${sessionId}`;
    
    console.log('Creating posts channel:', channelName);
    
    try {
      const channel = supabase.channel(channelName);
      
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          console.log('Post updated:', payload);
          // Mettre à jour le post spécifique dans la liste
          setPosts(prev => prev.map(post => 
            post.id === payload.new.id 
              ? { ...post, ...payload.new }
              : post
          ));
        }
      );

      channel.subscribe((status: string) => {
        console.log('Posts subscription status:', status);
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up posts channel:', error);
    }

    return () => {
      if (channelRef.current) {
        console.log('Unsubscribing from posts channel');
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing posts channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, []); // Removed user dependency to prevent re-subscriptions

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
