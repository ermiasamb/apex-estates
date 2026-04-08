'use client';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import type { Property } from '@/lib/types';
import { useMapsApi } from './MapsApiProvider';
import { Skeleton } from '../ui/skeleton';
import { useMemo } from 'react';

interface PropertyMapProps {
  properties: Property[];
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const isLoaded = useMapsApi();

  const defaultPosition = useMemo(() => {
    if (properties.length === 1) {
      return properties[0].coordinates;
    }
    if (properties.length > 1) {
      // Calculate center of all properties
      const avgLat = properties.reduce((sum, p) => sum + p.coordinates.lat, 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + p.coordinates.lng, 0) / properties.length;
      return { lat: avgLat, lng: avgLng };
    }
    // Default to a central location if no properties are available
    return { lat: 34.0522, lng: -118.2437 }; // Los Angeles
  }, [properties]);
  
  const zoomLevel = properties.length === 1 ? 14 : 10;

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={defaultPosition}
      zoom={zoomLevel}
      options={{ 
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {properties.map((property) => (
        <MarkerF key={property.id} position={property.coordinates} />
      ))}
    </GoogleMap>
  );
}
