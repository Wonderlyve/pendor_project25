
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Erreur lors du chargement des posts');
        return;
      }

      // Transform data to match Post interface
      const transformedPosts = data?.map((post: any) => ({
        ...post,
        username: post.profiles?.username,
        display_name: post.profiles?.display_name,
        avatar_url: post.profiles?.avatar_url,
        badge: post.profiles?.badge,
        like_count: post.likes,
        comment_count: post.comments
      })) || [];

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

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

      // Upload image if provided
      if (postData.image_file) {
        image_url = await uploadFile(postData.image_file, 'post-images');
      }

      // Upload video if provided
      if (postData.video_file) {
        video_url = await uploadFile(postData.video_file, 'post-videos');
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
      fetchPosts(); // Refresh posts
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
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unliking post:', error);
          return;
        }
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          console.error('Error liking post:', error);
          return;
        }
      }

      fetchPosts(); // Refresh posts to update like count
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    likePost,
    refetch: fetchPosts
  };
};
