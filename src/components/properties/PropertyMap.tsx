'use client';
import { GoogleMap, MarkerF, InfoWindowF, CircleF } from '@react-google-maps/api';
import type { Property } from '@/lib/types';
import { useMapsApi } from './MapsApiProvider';
import { Skeleton } from '../ui/skeleton';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import placeholderImagesData from '@/lib/placeholder-images.json';

interface PropertyMapProps {
  properties: Property[];
  onRadiusChange?: (radius: number) => void;
  defaultRadius?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

export function PropertyMap({ properties, onRadiusChange, defaultRadius = 25 }: PropertyMapProps) {
  const isLoaded = useMapsApi();
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radius, setRadius] = useState(defaultRadius);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's current location
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to get your location');
          // Default to Addis Ababa
          setUserLocation({ lat: 9.021808, lng: 38.800203 });
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      setUserLocation({ lat: 9.021808, lng: 38.800203 });
    }
  }, []);

  // Convert radius to meters for distance calculation
  const radiusInMeters = radius * 1000;

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter properties within radius
  const filteredProperties = useMemo(() => {
    if (!userLocation) return properties;
    return properties.filter(p => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        p.coordinates.lat,
        p.coordinates.lng
      );
      return distance <= radius;
    });
  }, [properties, userLocation, radius]);

  const activeProperty = useMemo(() => {
    if (!activeMarker) return null;
    return filteredProperties.find(p => p.id === activeMarker);
  }, [activeMarker, filteredProperties]);

  const defaultPosition = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }
    if (filteredProperties.length === 1) {
      return filteredProperties[0].coordinates;
    }
    if (filteredProperties.length > 0) {
      const avgLat = filteredProperties.reduce((sum, p) => sum + p.coordinates.lat, 0) / filteredProperties.length;
      const avgLng = filteredProperties.reduce((sum, p) => sum + p.coordinates.lng, 0) / filteredProperties.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 9.021808, lng: 38.800203 };
  }, [filteredProperties, userLocation]);

  const zoomLevel = 12;

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onRadiusChange?.(newRadius);
  };

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  const formatPrice = (price: number, type: 'sale' | 'rent') => {
    if (type === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  // Helper to create marker icon
  const getMarkerIcon = (fillColor: string, scale: number) => {
    return {
      path: 'M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
      fillColor,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation: 0,
      scale,
      anchor: typeof window !== 'undefined' ? new window.google.maps.Point(12, 24) : undefined,
    };
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Radius slider and info */}
      <div className="p-3 bg-card border-b">
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-sm font-medium">
              Search Radius: {radius} km
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Explore properties within {radius} kilometers of your location
            </p>
            <p className="text-xs text-muted-foreground">
              ንብረቶችን ከሥራዎ ቦታ {radius} ኪሎሜትር ውስጥ ያሳያል
            </p>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>1 km</span>
            <span>{filteredProperties.length} properties found</span>
            <span>100 km</span>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1">
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={defaultPosition}
          zoom={zoomLevel}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {/* User location marker */}
          {userLocation && (
            <>
              <MarkerF
                position={userLocation}
                icon={getMarkerIcon('#3b82f6', 1.5) as any}
                title="Your Location"
              />
              {/* Radius circle */}
              <CircleF
                center={userLocation}
                radius={radiusInMeters}
                options={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  strokeColor: '#3b82f6',
                  strokeOpacity: 0.3,
                  strokeWeight: 2,
                }}
              />
            </>
          )}

          {/* Property markers - without label to avoid error */}
          {filteredProperties.map((property) => (
            <MarkerF
              key={property.id}
              position={property.coordinates}
              onMouseOver={() => setActiveMarker(property.id)}
              onMouseOut={() => {}}
              icon={getMarkerIcon('#0066FF', 2.2) as any}
              title={`$${(property.price / 1000).toFixed(0)}K - ${property.title}`}
            />
          ))}

          {/* Property info window - horizontal layout with photo left 30% and info right 70% */}
          {activeProperty && (
            <InfoWindowF
              position={activeProperty.coordinates}
              onCloseClick={() => setActiveMarker(null)}
              options={{ pixelOffset: typeof window !== 'undefined' ? new window.google.maps.Size(0, -40) : undefined }}
            >
              <div className="w-96">
                <Link href={`/property/${activeProperty.id}`}>
                  <div className="flex gap-4 p-3 bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    {/* Left side - Photo (30%) */}
                    <div className="w-32 h-24 flex-shrink-0 rounded-md overflow-hidden">
                      {(() => {
                        const image = placeholderImagesData.placeholderImages.find(p => p.id === activeProperty.imageIds[0]);
                        if (!image) {
                          return (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          );
                        }
                        return (
                          <Image
                            src={image.imageUrl}
                            alt={image.description}
                            width={128}
                            height={96}
                            className="object-cover w-full h-full"
                            data-ai-hint={image.imageHint}
                          />
                        )
                      })()}
                    </div>

                    {/* Right side - Info (70%) */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Price */}
                      <div>
                        <p className="font-bold text-lg text-foreground">
                          {formatPrice(activeProperty.price, activeProperty.type)}
                        </p>
                      </div>

                      {/* Title */}
                      <p className="font-semibold text-sm text-foreground line-clamp-2 mb-2">
                        {activeProperty.title}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{activeProperty.bedrooms}</span>
                          <span>Bedrooms</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{activeProperty.bathrooms}</span>
                          <span>Bathrooms</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{activeProperty.area.toLocaleString()}</span>
                          <span>sqft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
