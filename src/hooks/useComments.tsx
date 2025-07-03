
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  parent_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    badge?: string;
  };
  is_liked?: boolean;
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for post:', postId);
      
      // Première requête pour récupérer les commentaires
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        toast.error('Erreur lors du chargement des commentaires');
        return;
      }

      console.log('Raw comments data:', commentsData);

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Récupérer les profils séparément
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      console.log('User IDs to fetch:', userIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, badge')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      console.log('Profiles data:', profilesData);

      // Créer une map des profils pour un accès rapide
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Fetch likes for authenticated user
      let userLikes: string[] = [];
      if (user && commentsData) {
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsData.map(c => c.id));

        userLikes = likesData?.map(l => l.comment_id) || [];
      }

      // Transform comments avec les profils
      const transformedComments = commentsData.map(comment => {
        const profile = profilesMap.get(comment.user_id);
        return {
          ...comment,
          likes_count: comment.likes_count || 0,
          profiles: profile ? {
            username: profile.username || 'Utilisateur',
            display_name: profile.display_name || profile.username || 'Utilisateur',
            avatar_url: profile.avatar_url || null,
            badge: profile.badge || null
          } : {
            username: 'Utilisateur inconnu',
            display_name: 'Utilisateur inconnu',
            avatar_url: null,
            badge: null
          },
          is_liked: userLikes.includes(comment.id),
          replies: [] as Comment[]
        };
      });

      console.log('Transformed comments:', transformedComments);

      // Organize replies
      const rootComments: Comment[] = [];
      const repliesMap: { [key: string]: Comment[] } = {};

      transformedComments.forEach(comment => {
        if (comment.parent_id) {
          if (!repliesMap[comment.parent_id]) {
            repliesMap[comment.parent_id] = [];
          }
          repliesMap[comment.parent_id].push(comment);
        } else {
          rootComments.push(comment);
        }
      });

      // Attach replies to their parent comments
      rootComments.forEach(comment => {
        comment.replies = repliesMap[comment.id] || [];
      });

      console.log('Final organized comments:', rootComments);
      setComments(rootComments);
    } catch (error) {
      console.error('Error in fetchComments:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour commenter');
      return null;
    }

    try {
      console.log('Creating comment:', { content, parentId, postId, userId: user.id });
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content,
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        toast.error('Erreur lors de la création du commentaire');
        return null;
      }

      console.log('Comment created:', data);
      toast.success('Commentaire ajouté avec succès !');
      fetchComments(); // Refresh comments
      return data;
    } catch (error) {
      console.error('Error in createComment:', error);
      toast.error('Erreur lors de la création du commentaire');
      return null;
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker un commentaire');
      return;
    }

    try {
      console.log('Toggling like for comment:', commentId);
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unliking comment:', error);
          return;
        }
        console.log('Comment unliked');
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (error) {
          console.error('Error liking comment:', error);
          return;
        }
        console.log('Comment liked');
      }

      fetchComments(); // Refresh comments to update like counts
    } catch (error) {
      console.error('Error in likeComment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      console.log('Deleting comment:', commentId);
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting comment:', error);
        toast.error('Erreur lors de la suppression du commentaire');
        return;
      }

      console.log('Comment deleted');
      toast.success('Commentaire supprimé avec succès');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error in deleteComment:', error);
      toast.error('Erreur lors de la suppression du commentaire');
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, user]);

  return {
    comments,
    loading,
    createComment,
    likeComment,
    deleteComment,
    refetch: fetchComments
  };
};
