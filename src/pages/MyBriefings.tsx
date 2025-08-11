import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Heart, MessageCircle, Play, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Briefing {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  post_link: string | null;
  likes: number;
  views: number;
  comments: number;
  created_at: string;
  is_public: boolean;
  channel_id: string | null;
}

const MyBriefings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBriefings();
  }, [user]);

  const fetchMyBriefings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('debriefings')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching briefings:', error);
        toast.error('Erreur lors du chargement des briefings');
      } else {
        setBriefings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des briefings');
    } finally {
      setLoading(false);
    }
  };

  const deleteBriefing = async (briefingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce briefing ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('debriefings')
        .delete()
        .eq('id', briefingId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      setBriefings(prev => prev.filter(b => b.id !== briefingId));
      toast.success('Briefing supprimé avec succès');
    } catch (error) {
      console.error('Error deleting briefing:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: fr 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white ml-4">Mes Briefings</h1>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement de vos briefings...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white ml-4">Mes Briefings</h1>
        </div>
      </div>

      <div className="p-4">
        {briefings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Aucun briefing</p>
                <p>Vous n'avez pas encore créé de briefings vidéo.</p>
                <Button
                  onClick={() => navigate('/channels')}
                  className="mt-4 bg-green-500 hover:bg-green-600"
                >
                  Créer un briefing
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {briefings.map((briefing) => (
              <Card key={briefing.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="relative w-32 h-24 bg-gray-200 flex-shrink-0">
                      {briefing.thumbnail_url ? (
                        <img
                          src={briefing.thumbnail_url}
                          alt={briefing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Play className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {briefing.is_public && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Public
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                            {briefing.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {briefing.description}
                          </p>
                          
                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {briefing.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              {briefing.likes}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {briefing.comments}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400">
                            {formatDate(briefing.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-2">
                          {briefing.video_url && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:bg-green-100"
                              onClick={() => window.open(briefing.video_url!, '_blank')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {briefing.post_link && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                              onClick={() => window.open(briefing.post_link!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:bg-red-100"
                            onClick={() => deleteBriefing(briefing.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyBriefings;