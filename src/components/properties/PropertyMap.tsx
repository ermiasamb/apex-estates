'use client';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Property } from '@/lib/types';
import { useState } from 'react';
import { PropertyCard } from './PropertyCard';

interface PropertyMapProps {
  properties: Property[];
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
        <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-center p-4">
            <h3 className="text-lg font-semibold">Map Unavailable</h3>
            <p className="text-muted-foreground text-sm">
                Google Maps API key is not configured. Please set <code className="bg-gray-200 text-gray-800 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your environment.
            </p>
        </div>
    );
  }
  
  const defaultCenter = properties.length > 0 
    ? properties[0].coordinates 
    : { lat: 34.0522, lng: -118.2437 };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={10}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="apex_estates_map"
      >
        {properties.map((property) => (
          <AdvancedMarker
            key={property.id}
            position={property.coordinates}
            onClick={() => setSelectedPropertyId(property.id)}
          >
            <Pin
              background={'hsl(var(--primary))'}
              borderColor={'hsl(var(--primary))'}
              glyphColor={'hsl(var(--primary-foreground))'}
            />
          </AdvancedMarker>
        ))}

        {selectedProperty && (
            <InfoWindow
                position={selectedProperty.coordinates}
                onCloseClick={() => setSelectedPropertyId(null)}
                pixelOffset={[0, -40]}
            >
                <div className="w-[320px] h-[450px]">
                    <PropertyCard property={selectedProperty} />
                </div>
            </InfoWindow>
        )}
      </Map>
    </div>
  );
}
