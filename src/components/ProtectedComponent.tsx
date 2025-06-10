
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface ProtectedComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  message?: string;
}

const ProtectedComponent = ({ children, fallback, message = "Vous devez être connecté pour accéder à cette fonctionnalité" }: ProtectedComponentProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex justify-center items-center p-4">Chargement...</div>;
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <LogIn className="w-8 h-8 text-gray-400 mb-3" />
        <p className="text-gray-600 text-center mb-4">{message}</p>
        <Button onClick={() => navigate('/auth')} className="bg-green-600 hover:bg-green-700">
          Se connecter
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedComponent;
