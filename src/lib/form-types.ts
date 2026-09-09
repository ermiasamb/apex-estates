/**
 * Comprehensive Form DTOs and Types
 * Aligned with backend PropertyDto and database schema
 * Used by both admin dashboard and frontend web app
 */

import { PropertyCategory, ListingType, PropertyStatus, Currency, ImageCategory, NearbyPlaceType, WaterSource, ElectricityStatus } from './form-constants';

/**
 * Location DTO - Comprehensive location information
 * Aligned with backend LocationDto
 */
export interface LocationDto {
  // Geographical hierarchy (Ethiopian administrative divisions)
  region?: string; // State/Region name
  state?: string; // Alias for region (backward compatibility)
  city?: string; // City name
  subCity?: string; // District/Sub-city
  neighborhood?: string; // Alias for subCity (backward compatibility)
  woreda?: string; // Administrative division (district)
  kebele?: string; // Smallest administrative division
  areaName?: string; // Specific area/neighborhood name
  
  // Address information
  address?: string; // Street address
  addressAm?: string; // Address in Amharic
  
  // GPS coordinates
  latitude?: number; // GPS latitude
  longitude?: number; // GPS longitude
  
  // Privacy settings
  showExactLocation?: boolean; // Show exact coordinates to public
}

/**
 * Pricing DTO - Complete pricing information
 * Aligned with backend PricingDto
 */
export interface PricingDto {
  price?: number; // Listing price
  currency?: Currency; // Currency (ETB, USD, EUR, GBP, AED)
  priceNegotiable?: boolean; // Is price negotiable?
  depositAmount?: number; // Required deposit amount
  paymentTerms?: string; // Payment terms description
  taxIncluded?: boolean; // Is price inclusive of tax/VAT?
}

/**
 * Property Details DTO - Detailed property specifications
 * Aligned with backend DetailsDto
 */
export interface PropertyDetailsDto {
  // Room counts
  bedrooms?: number; // Number of bedrooms
  bathrooms?: number; // Number of bathrooms
  totalRooms?: number; // Total rooms in property
  
  // Area measurements
  totalArea?: number; // Total area (sqft or sqm)
  lotSize?: number; // Lot/plot size
  
  // Building structure
  floorNumber?: number; // Current floor number (for apartments)
  totalFloors?: number; // Total floors in building
  yearBuilt?: number; // Year property was built
  
  // Utilities and features
  parkingSpaces?: number; // Number of parking spaces
  waterSource?: WaterSource; // Water supply source
  electricityStatus?: ElectricityStatus; // Electricity connection status
  
  // Description
  description?: string; // Property description in English
  descriptionAm?: string; // Property description in Amharic
  
  // Boolean amenities
  hasGuardHouse?: boolean; // Has guard house?
  internetReady?: boolean; // Is internet-ready?
}

/**
 * Environmental Information DTO - Area and neighborhood scores
 * Aligned with backend EnvironmentalInfoDto
 */
export interface EnvironmentalInfoDto {
  walkScore?: number; // Walkability score (0-100)
  bikeScore?: number; // Bikeability score (0-100)
  transitScore?: number; // Public transit score (0-100)
  roadSafety?: number; // Road safety score (0-100)
  floodRisk?: number; // Flood risk score (0-100)
  noiseLevel?: number; // Noise level score (0-100)
  airQuality?: number; // Air quality score (0-100)
}

/**
 * Nearby Place - Point of interest near property
 * Aligned with backend NearbyPlaceDto
 */
export interface NearbyPlaceDto {
  id?: string; // Database ID (for edit mode)
  name?: string; // Place name
  type?: NearbyPlaceType; // Type of place
  distance?: number; // Distance in km or meters
}

/**
 * Property Media Row - For display in tables
 */
export interface PropertyMediaRow {
  id?: string; // Database ID
  propertyId?: string; // Associated property
  url?: string; // Media URL
  publicUrl?: string; // Public CDN URL
  type?: 'IMAGE' | 'FLOOR_PLAN' | 'VIDEO' | 'VIRTUAL_TOUR';
  category?: ImageCategory;
  fileName?: string; // Original file name
  status?: string; // Upload status
  order?: number; // Display order
}

/**
 * Property Media State - Client-side media handling
 */
export interface PropertyMediaState {
  images: PropertyImageRow[];
  floorPlans: FloorPlanRow[];
  videoType: 'url' | 'upload';
  videoUrl: string;
  videoFile?: File;
  videoMediaId?: string;
  virtualTourUrl: string;
  deletedMediaIds: string[];
}

/**
 * Property Image Row - Individual image with metadata
 */
export interface PropertyImageRow {
  localId: string; // Temporary client-side ID
  file?: File; // File object for upload
  preview?: string; // Preview URL
  url?: string; // Existing image URL (edit mode)
  category: ImageCategory;
  mediaId?: string; // Database media ID
  order?: number;
  isFeatured?: boolean;
}

/**
 * Floor Plan Row - Floor plan image
 */
export interface FloorPlanRow {
  localId: string;
  file?: File;
  preview?: string;
  url?: string; // Existing URL (edit mode)
  mediaId?: string;
}

/**
 * Complete Property Form Values DTO
 * Combines all sub-DTOs into single form state
 * Backend compatible structure
 */
export interface PropertyFormValuesDto {
  // Basic Information
  id?: string; // Database ID (edit mode)
  title: string; // Property title (English)
  titleAm?: string; // Property title (Amharic)
  category: PropertyCategory; // Property category (UPPERCASE)
  listingType: ListingType; // Listing type: SALE | RENT | LEASE (UPPERCASE)
  status?: PropertyStatus; // Current status (UPPERCASE)
  
  // Nested DTOs
  location: LocationDto;
  pricing: PricingDto;
  details: PropertyDetailsDto;
  environmentalInfo: EnvironmentalInfoDto;
  
  // Relations
  amenities: string[]; // Array of amenity names
  nearbyPlaces: NearbyPlaceDto[];
  
  // SEO/Metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  featuredUntil?: string; // ISO datetime when featured status expires
  
  // Agent/Owner
  agentId?: string; // Assigned agent/broker ID
  
  // Timestamps
  publishedAt?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Form Display Options - For select/radio inputs
 */
export interface FormSelectOption {
  value: string;
  label: string;
}

/**
 * Form Error Response
 */
export interface FormErrorResponse {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form Submission Result
 */
export interface FormSubmissionResult {
  success: boolean;
  propertyId?: string;
  message?: string;
  errors?: FormErrorResponse[];
  statusCode?: number;
}

/**
 * Amenity with Icon - For UI display
 */
export interface AmenityOption {
  name: string;
  icon?: React.ComponentType<any>;
  category?: string;
}

/**
 * Property Status Badge Config
 */
export interface StatusBadgeConfig {
  status: PropertyStatus;
  label: string;
  color: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  description?: string;
}

/**
 * Form Validation Error Details
 */
export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'range' | 'pattern' | 'custom';
}

/**
 * Validation Schema Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Location with Address Components
 */
export interface LocationPickerResult {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  region?: string;
  country?: string;
}

/**
 * Agent/Broker for selection
 */
export interface AgentOption {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
}

/**
 * Empty/Default Form Values
 */
export function createEmptyPropertyFormValues(): PropertyFormValuesDto {
  return {
    title: '',
    titleAm: '',
    category: 'APARTMENT' as PropertyCategory,
    listingType: 'SALE' as ListingType,
    status: 'DRAFT' as PropertyStatus,
    location: {
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      subCity: 'Bole',
      woreda: '01',
      kebele: '01',
      areaName: 'Bole',
      address: '',
      addressAm: '',
      latitude: 9.021808,
      longitude: 38.800203,
      showExactLocation: false,
    },
    pricing: {
      price: 0,
      currency: 'ETB' as Currency,
      priceNegotiable: true,
      depositAmount: 0,
      paymentTerms: '',
      taxIncluded: false,
    },
    details: {
      bedrooms: 0,
      bathrooms: 0,
      totalRooms: 0,
      totalArea: 0,
      lotSize: 0,
      floorNumber: 0,
      totalFloors: 0,
      yearBuilt: new Date().getFullYear(),
      parkingSpaces: 0,
      description: '',
      descriptionAm: '',
      hasGuardHouse: false,
      internetReady: false,
    },
    environmentalInfo: {
      walkScore: 50,
      bikeScore: 50,
      transitScore: 50,
      roadSafety: 50,
      floodRisk: 50,
      noiseLevel: 50,
      airQuality: 50,
    },
    amenities: [],
    nearbyPlaces: [],
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    tags: [],
    featuredUntil: '',
    agentId: '',
  };
}

/**
 * Helper to check if property form has been modified
 */
export function isPropertyFormModified(original: Partial<PropertyFormValuesDto>, current: PropertyFormValuesDto): boolean {
  return JSON.stringify(original) !== JSON.stringify(current);
}
