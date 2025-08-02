import { useState, useRef } from 'react';
import { Crown, Eye, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VipPronoCardProps {
  totalOdds: number;
  imageUrl?: string;
  description: string;
  predictionText: string;
  createdAt: string;
  creatorUsername?: string;
  onReply?: (pronoData: any) => void;
}

const VipPronoCard = ({ 
  totalOdds, 
  imageUrl, 
  description, 
  predictionText, 
  createdAt, 
  creatorUsername,
  onReply
}: VipPronoCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    // Permettre le swipe vers la droite pour répondre
    if (diffX > 0 && diffX < 100) {
      setSwipeOffset(diffX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = swipeOffset;
    
    // Si swipe > 50px, déclencher la réponse
    if (diffX > 50 && onReply) {
      onReply({
        type: 'vip_prono',
        content: `Prono VIP (côte ${totalOdds}): ${description}`,
        creatorUsername
      });
    }
    
    setSwipeOffset(0);
  };

  return (
    <>
      <Card 
        ref={cardRef}
        className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md transition-transform select-none"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">PRONO VIP</span>
            <span className="text-xs text-yellow-600">
              {formatTime(createdAt)}
            </span>
          </div>

          {creatorUsername && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">
                Par {creatorUsername}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-bold text-lg text-green-600">
                {totalOdds}
              </span>
              <span className="text-sm text-gray-500">côte</span>
            </div>
          </div>

          {imageUrl && (
            <div className="mb-3">
              <img 
                src={imageUrl} 
                alt="Prono VIP" 
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}

          <p className="text-gray-700 text-sm mb-4">
            {description}
          </p>

          <Button 
            onClick={() => setShowDetails(true)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir le pronostique
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span>Détails du prono VIP</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <span className="font-bold text-xl text-green-600">
                  {totalOdds}
                </span>
                <span className="text-sm text-gray-500 ml-2">côte totale</span>
              </div>
            </div>

            {imageUrl && (
              <div>
                <img 
                  src={imageUrl} 
                  alt="Prono VIP" 
                  className="w-full h-60 object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700 text-sm">
                {description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Détails du pronostique</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {predictionText}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => setShowDetails(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VipPronoCard;