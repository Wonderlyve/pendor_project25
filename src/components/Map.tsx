
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation as NavigationIcon, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapProps {
  pickup?: Location;
  destination?: Location;
  onPickupChange?: (location: Location) => void;
  onDestinationChange?: (location: Location) => void;
  driverLocation?: Location;
  showDriver?: boolean;
}

const Map: React.FC<MapProps> = ({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  driverLocation,
  showDriver = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Simuler la géolocalisation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "Votre position actuelle"
        };
        setUserLocation(location);
        if (onPickupChange && !pickup) {
          onPickupChange(location);
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        // Position par défaut (Paris)
        const defaultLocation = {
          lat: 48.8566,
          lng: 2.3522,
          address: "Paris, France"
        };
        setUserLocation(defaultLocation);
        if (onPickupChange && !pickup) {
          onPickupChange(defaultLocation);
        }
      }
    );
  }, [onPickupChange, pickup]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convertir les coordonnées de clic en coordonnées géographiques simulées
    const lat = 48.8566 + (y - rect.height / 2) * 0.01;
    const lng = 2.3522 + (x - rect.width / 2) * 0.01;
    
    const clickedLocation = {
      lat,
      lng,
      address: `Point sélectionné (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    };

    if (!pickup && onPickupChange) {
      onPickupChange(clickedLocation);
    } else if (!destination && onDestinationChange) {
      onDestinationChange(clickedLocation);
    }
  };

  return (
    <Card className="w-full h-96 relative overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Carte interactive
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef}
          onClick={handleMapClick}
          className="w-full h-80 bg-gradient-to-br from-blue-100 to-green-100 relative cursor-crosshair"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
              linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
              linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 0, 0 0, 10px 10px, 10px 10px, 10px 10px'
          }}
        >
          {/* Marqueur utilisateur */}
          {userLocation && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: '50%',
                top: '50%'
              }}
            >
              <div className="bg-blue-500 rounded-full p-2 shadow-lg animate-pulse">
                <NavigationIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded shadow-md mt-1 whitespace-nowrap">
                Vous êtes ici
              </div>
            </div>
          )}

          {/* Marqueur point de départ */}
          {pickup && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: '40%',
                top: '40%'
              }}
            >
              <div className="bg-green-500 rounded-full p-2 shadow-lg">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded shadow-md mt-1 whitespace-nowrap">
                Départ
              </div>
            </div>
          )}

          {/* Marqueur destination */}
          {destination && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: '60%',
                top: '60%'
              }}
            >
              <div className="bg-red-500 rounded-full p-2 shadow-lg">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded shadow-md mt-1 whitespace-nowrap">
                Destination
              </div>
            </div>
          )}

          {/* Marqueur chauffeur */}
          {showDriver && driverLocation && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: '45%',
                top: '35%'
              }}
            >
              <div className="bg-yellow-500 rounded-full p-2 shadow-lg animate-bounce">
                <Car className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded shadow-md mt-1 whitespace-nowrap">
                Chauffeur
              </div>
            </div>
          )}

          {/* Ligne de trajet simulée */}
          {pickup && destination && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="40%"
                y1="40%"
                x2="60%"
                y2="60%"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
