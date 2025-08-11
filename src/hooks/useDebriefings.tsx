import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DebriefingData } from '@/components/channel-chat/DebriefingModal';

export interface Debriefing {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  creator_id: string;
  creator_username: string;
  likes: number;
  views: number;
  comments: number;
  isLiked: boolean;
  created_at: string;
  channel_id: string | null;
  thumbnail_url?: string;
  post_link?: string;
  is_public?: boolean;
}

export const useDebriefings = (channelId: string | null) => {
  const { user } = useAuth();
  const [debriefings, setDebriefings] = useState<Debriefing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDebriefings = async () => {
    setLoading(true);
    
    try {
      if (!channelId || channelId === 'general') {
        // Pour les débriefings généraux ou quand pas de channel spécifique
        setDebriefings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('debriefings')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const debriefingsWithUserInfo = await Promise.all(
        (data || []).map(async (debriefing) => {
          // Get creator username
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', debriefing.creator_id)
            .single();

          // Check if user has liked this debriefing
          const { data: likeData } = await supabase
            .from('debriefing_likes')
            .select('id')
            .eq('debriefing_id', debriefing.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          return {
            ...debriefing,
            creator_username: profileData?.username || 'Utilisateur',
            isLiked: !!likeData
          };
        })
      );

      setDebriefings(debriefingsWithUserInfo);
    } catch (error) {
      console.error('Error fetching debriefings:', error);
      toast.error('Erreur lors du chargement des débriefings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicDebriefings = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('debriefings')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const debriefingsWithUserInfo = await Promise.all(
        (data || []).map(async (debriefing) => {
          // Get creator username
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', debriefing.creator_id)
            .single();

          // Check if user has liked this debriefing
          const { data: likeData } = await supabase
            .from('debriefing_likes')
            .select('id')
            .eq('debriefing_id', debriefing.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          return {
            ...debriefing,
            creator_username: profileData?.username || 'Utilisateur',
            isLiked: !!likeData
          };
        })
      );

      setDebriefings(debriefingsWithUserInfo);
    } catch (error) {
      console.error('Error fetching public debriefings:', error);
      toast.error('Erreur lors du chargement des débriefings');
    } finally {
      setLoading(false);
    }
  };

  const createDebriefing = async (debriefingData: DebriefingData & { channelId?: string; isPublic?: boolean }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un débriefing');
      return false;
    }

    const isPublicBrief = debriefingData.isPublic || false;

    if (!isPublicBrief && (!channelId || channelId === 'general')) {
      toast.error('Sélectionnez un canal valide pour créer un débriefing');
      return false;
    }

    // Validation des données
    if (!debriefingData.title?.trim()) {
      toast.error('Le titre est requis');
      return false;
    }

    if (!debriefingData.description?.trim()) {
      toast.error('La description est requise');
      return false;
    }

    try {
      let videoUrl: string | null = null;
      let thumbnailUrl: string | null = null;
      
      // Upload video if provided
      if (debriefingData.video) {
        try {
          const videoFileName = `${user.id}/${Date.now()}-${debriefingData.video.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('debriefing-videos')
            .upload(videoFileName, debriefingData.video);

          if (uploadError) {
            console.error('Video upload error:', uploadError);
            throw new Error(`Erreur lors de l'upload de la vidéo: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('debriefing-videos')
            .getPublicUrl(videoFileName);
          
          videoUrl = urlData.publicUrl;
        } catch (error) {
          console.error('Video processing error:', error);
          throw new Error('Erreur lors du traitement de la vidéo');
        }
      }

      // Upload thumbnail if provided
      if (debriefingData.thumbnail) {
        try {
          const thumbnailFileName = `${user.id}/${Date.now()}-thumbnail-${debriefingData.thumbnail.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('debriefing-videos')
            .upload(thumbnailFileName, debriefingData.thumbnail);

          if (uploadError) {
            console.error('Thumbnail upload error:', uploadError);
            throw new Error(`Erreur lors de l'upload de l'image: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('debriefing-videos')
            .getPublicUrl(thumbnailFileName);
          
          thumbnailUrl = urlData.publicUrl;
        } catch (error) {
          console.error('Thumbnail processing error:', error);
          throw new Error('Erreur lors du traitement de l\'image');
        }
      }

      // Validate that at least video or thumbnail is provided for public briefs
      if (isPublicBrief && !videoUrl && !thumbnailUrl && !debriefingData.postLink?.trim()) {
        toast.error('Un brief public doit contenir au moins une vidéo, une image ou un lien');
        return false;
      }

      // Create debriefing in database
      const debriefingInsert = {
        title: debriefingData.title.trim(),
        description: debriefingData.description.trim(),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        post_link: debriefingData.postLink?.trim() || null,
        creator_id: user.id,
        channel_id: isPublicBrief ? null : channelId,
        is_public: isPublicBrief,
        likes: 0,
        views: 0,
        comments: 0
      };

      console.log('Inserting debriefing:', debriefingInsert);

      const { data, error } = await supabase
        .from('debriefings')
        .insert(debriefingInsert)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Erreur lors de l'enregistrement: ${error.message}`);
      }

      console.log('Debriefing created successfully:', data);

      // Get creator username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();

      const newDebriefing: Debriefing = {
        ...data,
        creator_username: profileData?.username || 'Vous',
        isLiked: false
      };

      // Add to the beginning of the list (newest first) only if it's for the current context
      if (isPublicBrief || channelId === null) {
        setDebriefings(prev => [newDebriefing, ...prev]);
      }
      
      toast.success(isPublicBrief ? 'Brief publié avec succès !' : 'Débriefing créé avec succès !');
      return true;
    } catch (error: any) {
      console.error('Error creating debriefing:', error);
      toast.error(error.message || 'Erreur lors de la création du débriefing');
      return false;
    }
  };

  const createPublicBrief = async (debriefingData: DebriefingData) => {
    return createDebriefing({ ...debriefingData, isPublic: true });
  };

  const likeDebriefing = async (debriefingId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker');
      return false;
    }

    try {
      const debriefing = debriefings.find(d => d.id === debriefingId);
      if (!debriefing) return false;

      if (debriefing.isLiked) {
        // Remove like
        const { error } = await supabase
          .from('debriefing_likes')
          .delete()
          .eq('debriefing_id', debriefingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('debriefing_likes')
          .insert({
            debriefing_id: debriefingId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Update local state
      setDebriefings(prev => prev.map(d => {
        if (d.id === debriefingId) {
          return {
            ...d,
            isLiked: !d.isLiked,
            likes: d.isLiked ? d.likes - 1 : d.likes + 1
          };
        }
        return d;
      }));
      
      return true;
    } catch (error) {
      console.error('Error liking debriefing:', error);
      toast.error('Erreur lors du like');
      return false;
    }
  };

  const deleteDebriefing = async (debriefingId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer');
      return false;
    }

    try {
      // Delete from database
      const { error } = await supabase
        .from('debriefings')
        .delete()
        .eq('id', debriefingId)
        .eq('creator_id', user.id);

      if (error) throw error;

      // Update local state
      setDebriefings(prev => prev.filter(d => d.id !== debriefingId));
      toast.success('Débriefing supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting debriefing:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  useEffect(() => {
    if (channelId && channelId !== 'general') {
      fetchDebriefings();
    } else {
      setDebriefings([]);
      setLoading(false);
    }

    // Setup realtime subscription for debriefings
    const channel = supabase
      .channel('debriefings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'debriefings'
        },
        async (payload) => {
          const newDebriefing = payload.new as any;
          
          // Only add if it matches current context
          if (
            (channelId && newDebriefing.channel_id === channelId) ||
            (!channelId && newDebriefing.is_public)
          ) {
            // Get creator username
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', newDebriefing.creator_id)
              .single();

            // Check if current user has liked this debriefing
            const { data: likeData } = await supabase
              .from('debriefing_likes')
              .select('id')
              .eq('debriefing_id', newDebriefing.id)
              .eq('user_id', user?.id)
              .maybeSingle();

            const debriefingWithInfo = {
              ...newDebriefing,
              creator_username: profileData?.username || 'Utilisateur',
              isLiked: !!likeData
            };

            setDebriefings(prev => [debriefingWithInfo, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, user?.id]);

  return {
    debriefings,
    loading,
    createDebriefing,
    createPublicBrief,
    fetchPublicDebriefings,
    likeDebriefing,
    deleteDebriefing,
    refetch: fetchDebriefings
  };
};