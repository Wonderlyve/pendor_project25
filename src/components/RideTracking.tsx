
import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, Clock, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  phone: string;
}

interface RideTrackingProps {
  rideId: string;
  status: 'searching' | 'driver_assigned' | 'driver_arriving' | 'in_progress' | 'completed';
  driver?: Driver;
  estimatedArrival?: number;
  onCancelRide?: () => void;
  onCompleteRide?: () => void;
}

const RideTracking: React.FC<RideTrackingProps> = ({
  rideId,
  status,
  driver,
  estimatedArrival,
  onCancelRide,
  onCompleteRide
}) => {
  const [countdown, setCountdown] = useState(estimatedArrival || 0);

  useEffect(() => {
    if (estimatedArrival && status === 'driver_arriving') {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [estimatedArrival, status]);

  const getStatusInfo = () => {
    switch (status) {
      case 'searching':
        return {
          title: 'Recherche d\'un chauffeur...',
          description: 'Nous trouvons le meilleur chauffeur pour vous',
          color: 'bg-blue-500',
          icon: '🔍'
        };
      case 'driver_assigned':
        return {
          title: 'Chauffeur trouvé !',
          description: 'Votre chauffeur se dirige vers vous',
          color: 'bg-green-500',
          icon: '✅'
        };
      case 'driver_arriving':
        return {
          title: 'Chauffeur en route',
          description: `Arrivée dans ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`,
          color: 'bg-yellow-500',
          icon: '🚗'
        };
      case 'in_progress':
        return {
          title: 'Course en cours',
          description: 'Profitez de votre trajet',
          color: 'bg-blue-500',
          icon: '🛣️'
        };
      case 'completed':
        return {
          title: 'Course terminée',
          description: 'Merci d\'avoir choisi AUTOCOP',
          color: 'bg-green-500',
          icon: '🎉'
        };
      default:
        return {
          title: 'Statut inconnu',
          description: '',
          color: 'bg-gray-500',
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      {/* Statut de la course */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 ${statusInfo.color} rounded-full flex items-center justify-center mx-auto text-white text-2xl`}>
              {statusInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">{statusInfo.title}</h2>
              <p className="text-gray-600">{statusInfo.description}</p>
            </div>
            <Badge variant="outline" className="text-sm">
              Course #{rideId}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Informations du chauffeur */}
      {driver && status !== 'searching' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Votre chauffeur</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <img
                  src={driver.photo}
                  alt={driver.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=3b82f6&color=fff`;
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{driver.name}</h3>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{driver.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
                </p>
                <p className="text-sm font-mono">{driver.vehicle.plate}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Appeler</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {status === 'searching' && (
          <Button
            onClick={onCancelRide}
            variant="outline"
            className="w-full"
          >
            Annuler la recherche
          </Button>
        )}
        
        {(status === 'driver_assigned' || status === 'driver_arriving') && (
          <Button
            onClick={onCancelRide}
            variant="outline"
            className="w-full"
          >
            Annuler la course
          </Button>
        )}
        
        {status === 'completed' && (
          <Button
            onClick={onCompleteRide}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Évaluer la course
          </Button>
        )}
      </div>
    </div>
  );
};

export default RideTracking;
