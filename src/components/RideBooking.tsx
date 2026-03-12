
import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Car } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface RideBookingProps {
  pickup?: Location;
  destination?: Location;
  onPickupChange?: (location: Location) => void;
  onDestinationChange?: (location: Location) => void;
  onBookRide?: (rideDetails: any) => void;
}

const RideBooking: React.FC<RideBookingProps> = ({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onBookRide
}) => {
  const [pickupAddress, setPickupAddress] = useState(pickup?.address || '');
  const [destinationAddress, setDestinationAddress] = useState(destination?.address || '');
  const [selectedVehicle, setSelectedVehicle] = useState('standard');

  const vehicleTypes = [
    {
      id: 'economy',
      name: 'Economy',
      description: 'Trajet abordable',
      price: 12.50,
      time: '3-5 min',
      icon: '🚗'
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Trajet confortable',
      price: 18.75,
      time: '2-4 min',
      icon: '🚙'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Trajet de luxe',
      price: 28.90,
      time: '5-7 min',
      icon: '🚗'
    }
  ];

  const calculateEstimate = () => {
    const baseDistance = 5.2; // km simulé
    const baseDuration = 12; // minutes simulé
    const selectedVehicleType = vehicleTypes.find(v => v.id === selectedVehicle);
    
    return {
      distance: baseDistance,
      duration: baseDuration,
      price: selectedVehicleType?.price || 15.00
    };
  };

  const estimate = calculateEstimate();

  const handleBookRide = () => {
    const rideDetails = {
      pickup,
      destination,
      vehicleType: selectedVehicle,
      estimate,
      timestamp: new Date().toISOString()
    };
    
    if (onBookRide) {
      onBookRide(rideDetails);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire de sélection des adresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-yellow-500" />
            <span>Votre trajet</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup">Point de départ</Label>
            <Input
              id="pickup"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Saisissez votre adresse de départ"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="Où souhaitez-vous aller ?"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sélection du type de véhicule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-500" />
            <span>Choisissez votre véhicule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {vehicleTypes.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{vehicle.icon}</span>
                    <div>
                      <h3 className="font-semibold">{vehicle.name}</h3>
                      <p className="text-sm text-gray-600">{vehicle.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{vehicle.price.toFixed(2)}€</div>
                    <div className="text-sm text-gray-500">{vehicle.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résumé du trajet */}
      {pickupAddress && destinationAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span>Résumé du trajet</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Distance</span>
                <span className="font-semibold">{estimate.distance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durée estimée</span>
                <span className="font-semibold">{estimate.duration} min</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Prix total</span>
                <span className="font-bold text-green-600">{estimate.price.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bouton de réservation */}
      <Button
        onClick={handleBookRide}
        className="w-full py-6 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-slate-900"
        disabled={!pickupAddress || !destinationAddress}
      >
        <Car className="w-5 h-5 mr-2" />
        Commander AUTOCOP
      </Button>
    </div>
  );
};

export default RideBooking;
