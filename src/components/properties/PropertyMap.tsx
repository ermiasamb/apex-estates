'use client';

import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import type { Property } from '@/lib/types';
import { PropertyCard } from './PropertyCard';
import { useState } from 'react';
import { useIsMapsApiLoaded } from './MapsApiProvider';
import { Skeleton } from '../ui/skeleton';

interface PropertyMapProps {
  properties: Property[];
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

export function PropertyMap({ properties }: PropertyMapProps) {
  const isLoaded = useIsMapsApiLoaded();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const defaultCenter = properties.length > 0
    ? properties[0].coordinates
    : { lat: 34.0522, lng: -118.2437 };
  
  const mapKey = properties.map(p => p.id).join('-');

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <GoogleMap
      key={mapKey}
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={10}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={property.coordinates}
          onClick={() => setSelectedProperty(property)}
        />
      ))}

      {selectedProperty && (
        <InfoWindow
          position={selectedProperty.coordinates}
          onCloseClick={() => setSelectedProperty(null)}
        >
          <div className="w-[320px] h-[450px]">
            <PropertyCard property={selectedProperty} />
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
