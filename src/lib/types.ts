import type { LucideIcon } from 'lucide-react';

export type PropertyCategory = 'apartment' | 'condominium' | 'villa' | 'house' | 'townhouse' | 'land';

// Align with backend PropertyStatus enum in Prisma schema
export type PropertyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'RENTED' | 'EXPIRED' | 'ARCHIVED' | 'REJECTED';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'sale' | 'rent';
  category: PropertyCategory;
  price: number;
  location: string;
  address: string;
  coordinates: { lat: number; lng: number };
  bedrooms: number;
  bathrooms: number;
  area: number; // in sqft
  imageIds: string[];
  images?: string[];
  amenities: string[];
  floorPlanId: string;
  floorPlanUrl?: string;
  videoUrl?: string;
  brokerId: string;
  status: PropertyStatus | string;
  vrTourUrl?: string;
  nearbyPlaces?: NearbyPlace[];
  postedOn: string; // ISO date string
  views: number;
  saves: number;
  priceHistory: PriceHistoryEntry[];
  environmentalInfo: EnvironmentalInfo;
  broker?: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };
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
