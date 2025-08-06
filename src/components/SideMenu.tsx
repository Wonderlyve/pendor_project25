
import { useState } from 'react';
import { X, User, Home, Video, TrendingUp, Settings, HelpCircle, LogOut, Bell, Bookmark, Shield, Info, Upload, Smartphone } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SideMenu = ({ open, onOpenChange }: SideMenuProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Accueil', action: () => { navigate('/'); onOpenChange(false); } },
    { icon: User, label: 'Mon Profil', action: () => { navigate('/profile'); onOpenChange(false); } },
    { icon: Video, label: 'Lives', action: () => { navigate('/lives'); onOpenChange(false); } },
    { icon: TrendingUp, label: 'Classements', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => { navigate('/notifications'); onOpenChange(false); } },
    { icon: Bookmark, label: 'Favoris', action: () => { navigate('/favorites'); onOpenChange(false); } },
  ];

  // Ajouter les options pour l'utilisateur Smart
  const smartMenuItems = user?.email === 'smart@example.com' || user?.user_metadata?.display_name === 'Smart'
    ? [
        { icon: Upload, label: 'Poster', action: () => { navigate('/bulk-post'); onOpenChange(false); } },
        { icon: Smartphone, label: 'Update', action: () => { navigate('/update'); onOpenChange(false); } }
      ]
    : [];

  const settingsItems = [
    { icon: Settings, label: 'Paramètres', action: () => { navigate('/settings'); onOpenChange(false); } },
    { icon: HelpCircle, label: 'Aide & Support', action: () => { navigate('/help'); onOpenChange(false); } },
    { icon: Shield, label: 'Politique de confidentialité', action: () => { navigate('/privacy'); onOpenChange(false); } },
    { icon: Info, label: 'À propos', action: () => { navigate('/about'); onOpenChange(false); } },
  ];

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
    navigate('/');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header avec logo */}
          <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/35ad5651-d83e-4704-9851-61f3ad9fb0c3.png" 
                alt="PENDOR Logo" 
                className="w-12 h-12 rounded-full bg-white/20 p-1"
              />
              <div>
                <SheetTitle className="text-white text-xl">PENDOR</SheetTitle>
                <p className="text-green-100 text-sm">Vos pronostics gagnants</p>
              </div>
            </div>
          </SheetHeader>

          {/* User Info */}
          {user ? (
            <div className="p-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-sm text-gray-500">Connecté</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 pb-4">
              <Button 
                onClick={() => { navigate('/auth'); onOpenChange(false); }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Se connecter
              </Button>
            </div>
          )}

          <Separator />

          {/* Navigation Menu */}
          <div className="flex-1 py-4">
            <div className="space-y-1 px-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12 px-4 text-left"
                    onClick={item.action}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
              
              {/* Menu Smart uniquement pour les utilisateurs Smart */}
              {smartMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={`smart-${index}`}
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12 px-4 text-left bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200"
                    onClick={item.action}
                  >
                    <Icon className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-700 font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1 px-3">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12 px-4 text-left"
                    onClick={item.action}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          {user && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start space-x-3 h-12 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;
