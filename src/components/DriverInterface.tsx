
import React, { useState } from 'react';
import { Car, MapPin, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

interface DriverInterfaceProps {
  isOnline: boolean;
  onToggleOnline: (online: boolean) => void;
  pendingRequests: RideRequest[];
  onAcceptRide: (rideId: string) => void;
  onDeclineRide: (rideId: string) => void;
}

const DriverInterface: React.FC<DriverInterfaceProps> = ({
  isOnline,
  onToggleOnline,
  pendingRequests,
  onAcceptRide,
  onDeclineRide
}) => {
  const [stats] = useState({
    todayEarnings: 156.75,
    totalRides: 12,
    rating: 4.8,
    acceptance: 95
  });

  return (
    <div className="space-y-6">
      {/* Statut en ligne/hors ligne */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold">Mode Chauffeur</h2>
                <p className="text-gray-600">
                  {isOnline ? 'Vous êtes en ligne' : 'Vous êtes hors ligne'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="online-toggle">En ligne</Label>
              <Switch
                id="online-toggle"
                checked={isOnline}
                onCheckedChange={onToggleOnline}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Badge variant={isOnline ? "default" : "secondary"} className="text-sm">
              {isOnline ? '🟢 Disponible' : '🔴 Indisponible'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques du jour */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.todayEarnings}€</div>
              <div className="text-sm text-gray-600">Gains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRides}</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.rating}</div>
              <div className="text-sm text-gray-600">Note</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.acceptance}%</div>
              <div className="text-sm text-gray-600">Acceptation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demandes de course */}
      {isOnline && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Demandes de course</h3>
          
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucune demande en attente</p>
                <p className="text-sm text-gray-500">Restez en ligne pour recevoir des courses</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.passenger.photo}
                        alt={request.passenger.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.passenger.name)}&background=3b82f6&color=fff`;
                        }}
                      />
                      <div>
                        <h4 className="font-semibold">{request.passenger.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <span>⭐ {request.passenger.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{request.fare}€</div>
                      <div className="text-sm text-gray-600">{request.estimatedDuration} min</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Départ:</span>
                      <span>{request.pickup.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Destination:</span>
                      <span>{request.destination.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Distance:</span>
                      <span>{request.pickup.distance} km de vous</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => onDeclineRide(request.id)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Refuser</span>
                    </Button>
                    <Button
                      onClick={() => onAcceptRide(request.id)}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accepter</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DriverInterface;
