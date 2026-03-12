
import { ArrowLeft, Trophy, Users, TrendingUp, Star } from '@/lib/icons';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import useScrollToTop from '@/hooks/useScrollToTop';

const About = () => {
  const navigate = useNavigate();
  useScrollToTop();

  const features = [
    {
      icon: Trophy,
      title: "Pronostics Experts",
      description: "Partagez vos analyses et pronostics avec une communauté passionnée"
    },
    {
      icon: Users,
      title: "Communauté Active",
      description: "Échangez avec d'autres pronostiqueurs et apprenez ensemble"
    },
    {
      icon: TrendingUp,
      title: "Statistiques Détaillées",
      description: "Suivez vos performances et progressez dans vos prédictions"
    },
    {
      icon: Star,
      title: "Lives Interactifs",
      description: "Participez à des lives et partagez vos pronostics en temps réel"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">À Propos</h1>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-70px)]">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Logo et présentation */}
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PENDOR</h2>
              <p className="text-gray-600 text-sm">
                La plateforme de référence pour les pronostiqueurs passionnés
              </p>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notre Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              <p>
                PENDOR rassemble une communauté de pronostiqueurs passionnés autour du sport et des jeux de hasard. Notre objectif est de créer un espace d'échange, d'apprentissage et de partage pour tous les amateurs de pronostics.
              </p>
              <p>
                Que vous soyez débutant ou expert, PENDOR vous offre les outils pour améliorer vos prédictions, suivre vos performances et échanger avec d'autres passionnés.
              </p>
            </CardContent>
          </Card>

          {/* Fonctionnalités */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fonctionnalités</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{feature.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">En Chiffres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">10k+</div>
                  <div className="text-xs text-gray-600">Utilisateurs actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">50k+</div>
                  <div className="text-xs text-gray-600">Pronostics publiés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">78%</div>
                  <div className="text-xs text-gray-600">Taux de satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-xs text-gray-600">Support disponible</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Équipe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notre Équipe</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              <p>
                PENDOR est développé par une équipe passionnée de sport et de technologie. Nous travaillons chaque jour pour améliorer votre expérience et vous offrir les meilleurs outils pour vos pronostics.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nous Contacter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Support</div>
                <div className="text-gray-600">support@pendor.app</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Partenariats</div>
                <div className="text-gray-600">partenariats@pendor.app</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Réseaux sociaux</div>
                <div className="text-gray-600">@PendorApp</div>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-gray-500 text-center py-4">
            Version 1.0.0 - © 2025 PENDOR
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default About;
