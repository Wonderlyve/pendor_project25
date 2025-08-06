import { useState, useEffect, useMemo } from 'react';
import { Play, Eye, Heart, ArrowLeft, Search, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import BottomNavigation from '@/components/BottomNavigation';
import DebriefingModal from '@/components/channel-chat/DebriefingModal';
import LoadingModal from '@/components/LoadingModal';
import SuccessModal from '@/components/SuccessModal';
import { useDebriefings } from '@/hooks/useDebriefings';
import { toast } from 'sonner';

const Brief = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { debriefings, loading, createPublicBrief, fetchPublicDebriefings, deleteDebriefing } = useDebriefings(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPublicDebriefings();
  }, []);

  const openBrief = (briefId: string) => {
    navigate(`/brief/${briefId}`);
  };

  const handleCreateBrief = async (briefData: any) => {
    setShowCreateModal(false);
    setShowLoadingModal(true);
    
    const success = await createPublicBrief(briefData);
    setShowLoadingModal(false);
    
    if (success) {
      setShowSuccessModal(true);
    }
  };

  const handleDeleteBrief = async (briefId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce brief ?')) {
      const success = await deleteDebriefing(briefId);
      if (success) {
        toast.success('Brief supprimé avec succès');
        fetchPublicDebriefings();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Filtered debriefings based on search query
  const filteredDebriefings = useMemo(() => {
    if (!searchQuery) return debriefings;
    
    return debriefings.filter(brief => 
      brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.creator_username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [debriefings, searchQuery]);

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Brief</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{filteredDebriefings.length} vidéo{filteredDebriefings.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher par titre ou auteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-0 focus:bg-white"
          />
        </div>
      </div>

      {/* Briefs Grid */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-sm">
                <div className="relative aspect-video bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredDebriefings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Aucun résultat trouvé' : 'Aucun brief disponible'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? `Aucun brief trouvé pour "${searchQuery}"` : 'Soyez le premier à publier un brief !'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateModal(true)}>
                Créer mon premier brief
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDebriefings.map((brief) => (
              <Card key={brief.id} className="overflow-hidden border-0 shadow-sm">
                <div 
                  className="cursor-pointer"
                  onClick={() => openBrief(brief.id)}
                >
                   {/* Thumbnail en format paysage */}
                  <div className="relative aspect-video bg-gray-900">
                    {brief.thumbnail_url ? (
                      <img
                        src={brief.thumbnail_url}
                        alt={brief.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Play className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm font-medium">{brief.title}</p>
                        </div>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      </div>
                    
                    {/* Menu options pour l'auteur */}
                    {user?.id === brief.creator_id && (
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-black/60 text-white hover:bg-black/80"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteBrief(brief.id, e)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    
                     {/* Stats overlay */}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(brief.views)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{brief.likes}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar par défaut */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {brief.creator_username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                          {brief.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{brief.creator_username}</span>
                          <span>•</span>
                          <span>{new Date(brief.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DebriefingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBrief}
      />
      
      <LoadingModal
        isOpen={showLoadingModal}
        title="Publication en cours..."
        description="Votre brief est en cours de publication, veuillez patienter."
      />
      
      <SuccessModal
        isOpen={showSuccessModal}
        title="Brief publié !"
        description="Votre brief a été publié avec succès et est maintenant visible par tous."
        onClose={() => setShowSuccessModal(false)}
      />

      <BottomNavigation />
    </div>
  );
};

export default Brief;