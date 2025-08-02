import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, title, description, onClose }: SuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4 py-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
          
          {/* Bannière pub */}
          <div className="w-full mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=80&h=60&fit=crop&crop=center" 
                alt="Success ad" 
                className="w-16 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">🚀 Promotion</p>
                <p className="text-xs text-green-700">
                  Passez à Premium pour des fonctionnalités exclusives !
                </p>
                <div className="mt-2 px-3 py-1 bg-green-100 rounded-full inline-block">
                  <span className="text-xs font-medium text-green-800">Découvrir Premium →</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button onClick={onClose} className="w-full mt-4">
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;