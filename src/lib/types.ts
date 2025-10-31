import type { LucideIcon } from 'lucide-react';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'sale' | 'rent';
  price: number;
  location: string;
  address: string;
  coordinates: { lat: number; lng: number };
  bedrooms: number;
  bathrooms: number;
  area: number; // in sqft
  imageIds: string[];
  amenities: string[];
  floorPlanId: string;
  videoUrl?: string;
  brokerId: string;
  status: 'available' | 'sold' | 'rented';
}

export interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarId: string;
}

export interface Amenity {
  name: string;
  icon: LucideIcon;
}
