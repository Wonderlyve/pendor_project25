import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import PredictionCard from '@/components/PredictionCard';
import BottomNavigation from '@/components/BottomNavigation';

const SharedPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) { setError(true); setLoading(false); return; }

      try {
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select(`*, profiles:user_id (username, display_name, avatar_url, badge)`)
          .eq('id', postId)
          .single();

        if (fetchError || !data) { setError(true); setLoading(false); return; }

        let parsedMatches: any[] = [];
        if (data.bet_type === 'combine' || data.bet_type === 'multiple') {
          try {
            if (data.prediction_text) {
              const parsed = JSON.parse(data.prediction_text);
              if (Array.isArray(parsed)) parsedMatches = parsed;
            }
          } catch {}
        }

        const transformed = {
          id: data.id,
          user_id: data.user_id,
          post_type: data.post_type,
          user: {
            username: data.profiles?.username || data.custom_username || 'Anonyme',
            avatar: data.profiles?.avatar_url || '/placeholder.svg',
            badge: data.profiles?.badge || 'Nouveau',
            badgeColor: data.profiles?.badge === 'Pro' ? 'bg-blue-500' : data.profiles?.badge === 'Confirmé' ? 'bg-green-500' : 'bg-gray-400',
          },
          match: data.match_teams || data.content?.substring(0, 50) || '',
          prediction: data.prediction_text || '',
          odds: data.odds?.toString() || '',
          confidence: data.confidence || 3,
          analysis: data.content || '',
          likes: data.likes || 0,
          shares: data.shares || 0,
          views: data.views || 0,
          successRate: 75,
          timeAgo: getTimeAgo(data.created_at),
          sport: data.sport || 'Football',
          image: data.image_url,
          video: data.video_url,
          totalOdds: data.odds?.toString(),
          reservationCode: data.reservation_code,
          betType: data.bet_type,
          matches: parsedMatches,
          matches_data: data.prediction_text,
        };

        setPost(transformed);
      } catch { setError(true); }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Ce post n'existe pas ou a été supprimé.</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground">Pronostic partagé</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto p-4">
        <PredictionCard prediction={post} />
      </div>
      <BottomNavigation />
    </div>
  );
};

const getTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
};

export default SharedPost;
