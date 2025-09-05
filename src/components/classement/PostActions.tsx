import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Flag, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface PostActionsProps {
  postId: string;
  isOwner: boolean;
  isBoosted: boolean;
  boostCount: number;
  visibilityScore?: number;
  onBoost: () => Promise<boolean>;
  onReport: (reason: string, description?: string) => Promise<boolean>;
}

export const PostActions = ({ 
  postId, 
  isOwner, 
  isBoosted, 
  boostCount, 
  visibilityScore,
  onBoost, 
  onReport 
}: PostActionsProps) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBoost = async () => {
    const success = await onBoost();
    if (success) {
      // Le toast est géré dans le hook
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Veuillez sélectionner une raison');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onReport(reportReason, reportDescription);
      if (success) {
        setReportDialogOpen(false);
        setReportReason('');
        setReportDescription('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportReasons = [
    'spam',
    'contenu_inapproprie',
    'fausses_informations',
    'harcelement',
    'contenu_duplique',
    'autre'
  ];

  const getScoreColor = (score?: number) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'default'; // Vert
    if (score >= 60) return 'secondary'; // Gris
    if (score >= 40) return 'outline'; // Jaune
    return 'destructive'; // Rouge
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'Non évalué';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  return (
    <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
      <div className="flex items-center gap-2">
        {!isOwner && (
          <Button
            variant={isBoosted ? "default" : "outline"}
            size="sm"
            onClick={handleBoost}
            className="flex items-center gap-1"
          >
            <TrendingUp className="w-4 h-4" />
            {isBoosted ? 'Boosté' : 'Boost'}
            {boostCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {boostCount}
              </Badge>
            )}
          </Button>
        )}

        {visibilityScore !== undefined && (
          <Badge variant={getScoreColor(visibilityScore)} className="text-xs">
            Score: {Math.round(visibilityScore)}/100 ({getScoreLabel(visibilityScore)})
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isOwner && (
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Signaler ce post</DialogTitle>
                <DialogDescription>
                  Aidez-nous à maintenir la qualité de la communauté en signalant les contenus inappropriés.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Raison du signalement</label>
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une raison" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="contenu_inapproprie">Contenu inapproprié</SelectItem>
                      <SelectItem value="fausses_informations">Fausses informations</SelectItem>
                      <SelectItem value="harcelement">Harcèlement</SelectItem>
                      <SelectItem value="contenu_duplique">Contenu dupliqué</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Description (optionnel)</label>
                  <Textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Ajoutez des détails sur le problème..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setReportDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleReport}
                    disabled={isSubmitting || !reportReason}
                  >
                    {isSubmitting ? 'Envoi...' : 'Signaler'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};