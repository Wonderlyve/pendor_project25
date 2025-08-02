import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  title: string;
  description: string;
}

const LoadingModal = ({ isOpen, title, description }: LoadingModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4 py-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
          
          {/* Bannière pub */}
          <div className="w-full mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=80&h=60&fit=crop&crop=center" 
                alt="Tech ad" 
                className="w-16 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">🎯 Publicité</p>
                <p className="text-xs text-blue-700">
                  Découvrez nos services premium pour booster votre contenu !
                </p>
                <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full inline-block">
                  <span className="text-xs font-medium text-blue-800">En savoir plus →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;