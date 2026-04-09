'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useMapsApi } from './MapsApiProvider';
import { Skeleton } from '../ui/skeleton';

interface LocationPickerProps {
  initialPosition: { lat: number; lng: number };
  onLocationChange: (location: { lat: number; lng: number; address: string, cityState: string }) => void;
}

export function LocationPicker({ initialPosition, onLocationChange }: LocationPickerProps) {
  const isLoaded = useMapsApi();
  const [markerPosition, setMarkerPosition] = useState(initialPosition);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
        if(window.google) {
            geocoderRef.current = new window.google.maps.Geocoder();
        }
    }
  }, [isLoaded]);


  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);

      if (geocoderRef.current) {
        geocoderRef.current.geocode({ location: newPos }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const address = results[0].formatted_address;
            
            let city = '';
            let state = '';

            for (const component of results[0].address_components) {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                }
            }
            const cityState = (city && state) ? `${city}, ${state}` : (city || state);

            onLocationChange({ ...newPos, address, cityState });

          } else {
             onLocationChange({ ...newPos, address: 'Address not found', cityState: '' });
          }
        });
      }
    }
  }, [onLocationChange]);

  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={initialPosition}
      zoom={12}
      onClick={handleMapClick}
      options={{
          streetViewControl: false,
          mapTypeControl: false,
      }}
    >
      <MarkerF position={markerPosition} draggable={true} onDragEnd={handleMapClick} />
    </GoogleMap>
  );
}
