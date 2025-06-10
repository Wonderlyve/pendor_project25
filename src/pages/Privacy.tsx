
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import useScrollToTop from '@/hooks/useScrollToTop';

const Privacy = () => {
  const navigate = useNavigate();
  useScrollToTop();

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
          <h1 className="text-lg font-semibold">Politique de Confidentialité</h1>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-70px)]">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collecte des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                Nous collectons les informations que vous nous fournissez directement, notamment :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Informations de compte (nom d'utilisateur, email)</li>
                <li>Pronostics et analyses que vous publiez</li>
                <li>Interactions avec d'autres utilisateurs</li>
                <li>Données d'utilisation de l'application</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Utilisation des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>Nous utilisons vos données pour :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience</li>
                <li>Faciliter les interactions entre utilisateurs</li>
                <li>Analyser l'utilisation de l'application</li>
                <li>Assurer la sécurité de la plateforme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partage des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                Nous ne vendons pas vos données personnelles. Nous pouvons partager des informations dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Avec votre consentement explicite</li>
                <li>Pour respecter nos obligations légales</li>
                <li>Avec nos prestataires de services (sous contrat)</li>
                <li>En cas de fusion ou acquisition</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vos Droits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>Vous avez le droit de :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier ou supprimer vos informations</li>
                <li>Limiter le traitement de vos données</li>
                <li>Porter vos données vers un autre service</li>
                <li>Vous opposer au traitement de vos données</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la modification, la divulgation ou la destruction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                Pour toute question concernant cette politique de confidentialité, contactez-nous à :
              </p>
              <p className="font-medium">privacy@pendor.app</p>
            </CardContent>
          </Card>

          <div className="text-xs text-gray-500 text-center py-4">
            Dernière mise à jour : 6 juin 2025
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Privacy;
