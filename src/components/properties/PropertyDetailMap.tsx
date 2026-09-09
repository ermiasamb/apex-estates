'use client';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import type { Property } from '@/lib/types';
import { useMapsApi } from './MapsApiProvider';
import { Skeleton } from '../ui/skeleton';

interface PropertyDetailMapProps {
  property: Property;
}

export function PropertyDetailMap({ property }: PropertyDetailMapProps) {
  const isLoaded = useMapsApi();

  if (!isLoaded) {
    return <Skeleton className="h-full w-full rounded-lg" />;
  }

  // Helper to create marker icon
  const getMarkerIcon = () => {
    return {
      path: 'M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
      fillColor: '#0066FF',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation: 0,
      scale: 2.2,
      anchor: typeof window !== 'undefined' ? new window.google.maps.Point(12, 24) : undefined,
    };
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={property.coordinates}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        }}
      >
        {/* Property location marker */}
        <MarkerF
          position={property.coordinates}
          icon={getMarkerIcon() as any}
          title={property.title}
        />
      </GoogleMap>
    </div>
  );
}
