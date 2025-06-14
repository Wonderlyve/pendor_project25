import { Settings as SettingsIcon, User, Bell, Shield, Smartphone, Globe, Moon, Sun, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { toast } from 'sonner';
import { useState } from 'react';

const Settings = () => {
  const navigate = useNavigate();
  const [publicProfile, setPublicProfile] = useState(true);
  const { user, signOut } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const { 
    pushNotifications, 
    emailNotifications, 
    togglePushNotifications, 
    toggleEmailNotifications 
  } = useNotificationSettings();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const settingSections = [
    {
      title: 'Compte',
      icon: User,
      items: [
        {
          label: 'Profil public',
          description: 'Permettre aux autres utilisateurs de voir votre profil',
          value: publicProfile,
          onChange: setPublicProfile
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Notifications push',
          description: 'Recevoir des notifications sur votre appareil',
          value: pushNotifications,
          onChange: togglePushNotifications
        },
        {
          label: 'Notifications par email',
          description: 'Recevoir des notifications par email',
          value: emailNotifications,
          onChange: toggleEmailNotifications
        }
      ]
    },
    {
      title: 'Apparence',
      icon: isDarkMode ? Moon : Sun,
      items: [
        {
          label: 'Mode sombre',
          description: 'Utiliser le thème sombre de l\'application',
          value: isDarkMode,
          onChange: setDarkMode
        }
      ]
    },
    {
      title: 'Confidentialité',
      icon: Shield,
      items: [
        {
          label: 'Profil privé',
          description: 'Seuls vos abonnés peuvent voir vos pronostics',
          value: false,
          onChange: () => {}
        }
      ]
    }
  ];

  const handleSaveSettings = () => {
    toast.success('Paramètres sauvegardés avec succès');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <SettingsIcon className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-xl font-bold text-foreground">Paramètres</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* User Info */}
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
              </h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <section.icon className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground">{section.title}</h3>
            </div>
            
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={item.value}
                    onCheckedChange={item.onChange}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleSaveSettings} className="w-full">
            Sauvegarder les paramètres
          </Button>

          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
          
          <Card className="p-4">
            <h3 className="font-semibold text-red-600 mb-2">Zone de danger</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ces actions sont irréversibles. Procédez avec prudence.
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full text-red-600 border-red-200">
                Supprimer mon compte
              </Button>
            </div>
          </Card>
        </div>

        {/* App Info */}
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">PENDOR v1.0.0</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 PENDOR. Tous droits réservés.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
