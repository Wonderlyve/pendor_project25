
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import DriverInterface from '../components/DriverInterface';
import Map from '../components/Map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RideRequest {
  id: string;
  passenger: {
    name: string;
    rating: number;
    photo: string;
  };
  pickup: {
    address: string;
    distance: number;
  };
  destination: {
    address: string;
  };
  fare: number;
  estimatedDuration: number;
}

const Driver = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([
    {
      id: 'REQ001',
      passenger: {
        name: 'Marie Martin',
        rating: 4.6,
        photo: 'https://ui-avatars.com/api/?name=Marie+Martin&background=e11d48&color=fff'
      },
      pickup: {
        address: '123 Rue de la Paix, Paris',
        distance: 2.3
      },
      destination: {
        address: '456 Avenue des Champs-Élysées, Paris'
      },
      fare: 18.50,
      estimatedDuration: 15
    },
    {
      id: 'REQ002',
      passenger: {
        name: 'Pierre Durand',
        rating: 4.9,
        photo: 'https://ui-avatars.com/api/?name=Pierre+Durand&background=059669&color=fff'
      },
      pickup: {
        address: '789 Boulevard Saint-Germain, Paris',
        distance: 1.8
      },
      destination: {
        address: 'Gare du Nord, Paris'
      },
      fare: 25.75,
      estimatedDuration: 20
    }
  ]);

  const handleToggleOnline = (online: boolean) => {
    setIsOnline(online);
    if (!online) {
      // Effacer les demandes en attente quand on se met hors ligne
      setPendingRequests([]);
    } else {
      // Simuler de nouvelles demandes quand on se met en ligne
      setTimeout(() => {
        setPendingRequests([
          {
            id: 'REQ003',
            passenger: {
              name: 'Sophie Leroy',
              rating: 4.7,
              photo: 'https://ui-avatars.com/api/?name=Sophie+Leroy&background=7c3aed&color=fff'
            },
            pickup: {
              address: '12 Rue de Rivoli, Paris',
              distance: 3.2
            },
            destination: {
              address: 'Aéroport Charles de Gaulle'
            },
            fare: 45.00,
            estimatedDuration: 35
          }
        ]);
      }, 5000);
    }
  };

  const handleAcceptRide = (rideId: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== rideId));
    // Ici on pourrait naviguer vers une interface de navigation
    console.log('Course acceptée:', rideId);
  };

  const handleDeclineRide = (rideId: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== rideId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Interface Chauffeur <span className="text-yellow-500">AUTOCOP</span>
          </h1>
          <p className="text-gray-600">
            Gérez vos courses et maximisez vos gains
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interface chauffeur */}
          <div>
            <DriverInterface
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              pendingRequests={pendingRequests}
              onAcceptRide={handleAcceptRide}
              onDeclineRide={handleDeclineRide}
            />
          </div>

          {/* Carte pour le chauffeur */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Votre position</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Map
                  pickup={{
                    lat: 48.8566,
                    lng: 2.3522,
                    address: "Votre position"
                  }}
                  showDriver={true}
                  driverLocation={{
                    lat: 48.8566,
                    lng: 2.3522
                  }}
                />
              </CardContent>
            </Card>

            {/* Conseils pour chauffeurs */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Conseils du jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Heures de forte demande</h4>
                      <p className="text-sm text-gray-600">
                        7h-9h et 17h-19h sont les créneaux les plus rentables
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Zones recommandées</h4>
                      <p className="text-sm text-gray-600">
                        Centre-ville et gares ont une demande élevée
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Taux d'acceptation</h4>
                      <p className="text-sm text-gray-600">
                        Maintenez un taux &gt;90% pour plus de demandes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Driver;
