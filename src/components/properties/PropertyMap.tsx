'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Property } from '@/lib/types';
import { PropertyCard } from './PropertyCard';

// This is the fix for the marker icon issue with Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});


interface PropertyMapProps {
  properties: Property[];
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const defaultCenter = properties.length > 0
    ? properties[0].coordinates
    : { lat: 34.0522, lng: -118.2437 };

  const mapKey = properties.map(p => p.id).join('-');

  // Leaflet uses [lat, lng] array, not object.
  const defaultPosition: [number, number] = [defaultCenter.lat, defaultCenter.lng];

  return (
    <MapContainer
        key={mapKey}
        center={defaultPosition}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
    >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => (
            <Marker
                key={property.id}
                position={[property.coordinates.lat, property.coordinates.lng]}
            >
                <Popup>
                    <div className="w-[320px] h-[450px]">
                        <PropertyCard property={property} />
                    </div>
                </Popup>
            </Marker>
        ))}
    </MapContainer>
  );
}
