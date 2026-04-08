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
  vrTourUrl?: string;
  nearbyPlaces?: NearbyPlace[];
  postedOn: string; // ISO date string
  views: number;
  saves: number;
  priceHistory: PriceHistoryEntry[];
  environmentalInfo: EnvironmentalInfo;
}

export interface PriceHistoryEntry {
    date: string; // ISO date string
    price: number;
}

export interface EnvironmentalInfo {
    walkScore: number;
    bikeScore: number;
    roadSafety: number;
    floodRisk: number;
    noiseLevel: number;
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

export type NearbyPlaceType = 'hospital' | 'school' | 'restaurant' | 'church' | 'playground' | 'transport' | 'gym' | 'spa' | 'mall';

export interface NearbyPlace {
    name: string;
    type: NearbyPlaceType;
    distance: string;
}
