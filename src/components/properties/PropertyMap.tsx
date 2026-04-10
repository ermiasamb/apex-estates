'use client';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import type { Property } from '@/lib/types';
import { useMapsApi } from './MapsApiProvider';
import { Skeleton } from '../ui/skeleton';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images.json';

interface PropertyMapProps {
  properties: Property[];
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const isLoaded = useMapsApi();
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const activeProperty = useMemo(() => {
    if (!activeMarker) return null;
    return properties.find(p => p.id === activeMarker);
  }, [activeMarker, properties]);

  const defaultPosition = useMemo(() => {
    if (properties.length === 1) {
      return properties[0].coordinates;
    }
    if (properties.length > 0) {
      // Calculate center of all properties
      const avgLat = properties.reduce((sum, p) => sum + p.coordinates.lat, 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + p.coordinates.lng, 0) / properties.length;
      return { lat: avgLat, lng: avgLng };
    }
    // Default to a central location if no properties are available
    return { lat: 34.0522, lng: -118.2437 }; // Los Angeles
  }, [properties]);
  
  const zoomLevel = properties.length > 1 ? 10 : 14;

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  const formatPrice = (price: number, type: 'sale' | 'rent') => {
    if (type === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

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
        <MarkerF
          key={property.id}
          position={property.coordinates}
          onMouseOver={() => setActiveMarker(property.id)}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: 'hsl(var(--primary))',
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 24),
          }}
        />
      ))}

      {activeProperty && (
        <InfoWindowF
          position={activeProperty.coordinates}
          onCloseClick={() => setActiveMarker(null)}
          options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
        >
          <div className="w-64" onMouseLeave={() => setActiveMarker(null)}>
            <Link href={`/property/${activeProperty.id}`} className="block">
              <Card className="border-none shadow-none rounded-lg overflow-hidden">
                <CardHeader className="p-0 relative">
                  {(() => {
                    const image = placeholderImages.find(p => p.id === activeProperty.imageIds[0]);
                    if (!image) return null;
                    return (
                       <div className="aspect-[4/3] w-full relative">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover"
                            sizes="250px"
                            data-ai-hint={image.imageHint}
                        />
                       </div>
                    )
                  })()}
                </CardHeader>
                <CardContent className="p-3 bg-card">
                    <p className="font-bold text-lg text-card-foreground">{formatPrice(activeProperty.price, activeProperty.type)}</p>
                    <p className="font-semibold text-base truncate text-card-foreground" title={activeProperty.title}>{activeProperty.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{activeProperty.bedrooms} bds</span>
                        <span className="text-muted-foreground/50">|</span>
                        <span>{activeProperty.bathrooms} ba</span>
                         <span className="text-muted-foreground/50">|</span>
                        <span>{activeProperty.area.toLocaleString()} sqft</span>
                    </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
