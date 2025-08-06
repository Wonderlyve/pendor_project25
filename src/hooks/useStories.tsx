import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Story {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  location?: string;
  views: number;
  likes: number;
  comments: number;
  duration?: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  profiles?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  } | null;
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      // Récupérer les profils utilisateur
      const userIds = storiesData?.map(story => story.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      // Joindre les données
      const storiesWithProfiles = storiesData?.map(story => ({
        ...story,
        profiles: profilesData?.find(profile => profile.user_id === story.user_id) || null,
      })) || [];

      setStories(storiesWithProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des stories');
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (storyData: {
    content?: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    location?: string;
    duration?: number;
  }) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: newStory, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          ...storyData,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Récupérer le profil de l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const storyWithProfile = {
        ...newStory,
        profiles: profile || null,
      };
      
      setStories(prev => [storyWithProfile, ...prev]);
      return storyWithProfile;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de la story');
    }
  };

  const addStoryView = async (storyId: string) => {
    try {
      if (!user) return;

      // Vérifier si l'utilisateur a déjà vu cette story
      const { data: existingView } = await supabase
        .from('story_views')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .single();

      if (!existingView) {
        await supabase
          .from('story_views')
          .insert({
            story_id: storyId,
            user_id: user.id,
          });
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la vue:', err);
    }
  };

  const likeStory = async (storyId: string) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('story_likes')
        .insert({
          story_id: storyId,
          user_id: user.id,
        });

      if (error) throw error;
      
      // Mettre à jour le state local
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, likes: story.likes + 1 }
          : story
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors du like');
    }
  };

  const unlikeStory = async (storyId: string) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('story_likes')
        .delete()
        .eq('story_id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Mettre à jour le state local
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, likes: Math.max(0, story.likes - 1) }
          : story
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors du unlike');
    }
  };

  const checkIfLiked = async (storyId: string): Promise<boolean> => {
    try {
      if (!user) return false;

      const { data } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id); // S'assurer que seul le créateur peut supprimer

      if (error) throw error;

      // Mettre à jour le state local
      setStories(prev => prev.filter(story => story.id !== storyId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    error,
    createStory,
    addStoryView,
    likeStory,
    unlikeStory,
    checkIfLiked,
    deleteStory,
    refetch: fetchStories,
  };
};