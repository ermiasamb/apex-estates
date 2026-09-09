/**
 * Form Data Transformation Utilities
 * Converts between frontend form shape and backend DTO format
 * Handles enum case conversions, field name mapping, and data restructuring
 */

import { PropertyFormValuesDto, LocationDto, PricingDto, PropertyDetailsDto, EnvironmentalInfoDto } from './form-types';
import { PROPERTY_CATEGORIES, LISTING_TYPES, PROPERTY_STATUSES, CURRENCIES, DEFAULT_COORDINATES, DEFAULT_LOCATION } from './form-constants';

/**
 * Backend API Request Payload - Complete structure expected by backend
 */
export interface BackendPropertyPayload {
  title: string;
  titleAm?: string;
  category: string; // UPPERCASE enum
  listingType: string; // UPPERCASE enum
  status?: string; // UPPERCASE enum
  location?: LocationDto;
  pricing?: PricingDto;
  details?: PropertyDetailsDto;
  amenities?: string[];
  nearbyPlaces?: Array<{ name: string; type: string; distance: number }>;
  environmentalInfo?: EnvironmentalInfoDto;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  agentId?: string;
  featuredUntil?: string;
}

/**
 * Transform form values to backend API payload
 * Handles all enum conversions, field name mapping, and data restructuring
 */
export function transformFormToBackendPayload(formValues: PropertyFormValuesDto): BackendPropertyPayload {
  const payload: BackendPropertyPayload = {
    // Basic fields - pass through as-is
    title: formValues.title,
    
    // Enums - ensure uppercase (backend requirement)
    category: ensureUppercase(formValues.category) || 'APARTMENT',
    listingType: ensureUppercase(formValues.listingType) || 'SALE',
    status: formValues.status ? ensureUppercase(formValues.status) : undefined,
    
    // Nested DTOs - transform with defaults
    location: transformLocation(formValues.location),
    pricing: transformPricing(formValues.pricing),
    details: transformDetails(formValues.details),
    environmentalInfo: transformEnvironmentalInfo(formValues.environmentalInfo),
    
    // Arrays
    amenities: formValues.amenities || [],
    nearbyPlaces: transformNearbyPlaces(formValues.nearbyPlaces),
    
    // Relations
    agentId: formValues.agentId,
    featuredUntil: formValues.featuredUntil,
  };
  
  // Optional fields - only add if truthy
  if (formValues.titleAm) payload.titleAm = formValues.titleAm;
  if (formValues.metaTitle) payload.metaTitle = formValues.metaTitle;
  if (formValues.metaDescription) payload.metaDescription = formValues.metaDescription;
  if (formValues.keywords && formValues.keywords.length > 0) payload.keywords = formValues.keywords;
  
  return payload;
}

/**
 * Transform location object with fallbacks and aliases
 */
function transformLocation(location: Partial<LocationDto> = {}): LocationDto {
  // Handle aliases (state -> region, neighborhood -> subCity)
  const region = location.region || location.state || DEFAULT_LOCATION.region;
  const subCity = location.subCity || location.neighborhood || DEFAULT_LOCATION.subCity;
  const areaName = location.areaName || location.neighborhood || DEFAULT_LOCATION.areaName;

  return {
    region,
    city: location.city || DEFAULT_LOCATION.city,
    subCity,
    woreda: location.woreda || DEFAULT_LOCATION.woreda,
    kebele: location.kebele || DEFAULT_LOCATION.kebele,
    areaName,
    address: location.address || DEFAULT_LOCATION.address,
    addressAm: location.addressAm || location.address || DEFAULT_LOCATION.address,
    latitude: location.latitude !== undefined ? location.latitude : DEFAULT_COORDINATES.lat,
    longitude: location.longitude !== undefined ? location.longitude : DEFAULT_COORDINATES.lng,
    showExactLocation: location.showExactLocation ?? false,
  };
}

/**
 * Transform pricing object with defaults
 */
function transformPricing(pricing: Partial<PricingDto> = {}): PricingDto {
  return {
    price: pricing.price ?? 0,
    currency: pricing.currency || CURRENCIES.ETB, // Backend default is ETB
    priceNegotiable: pricing.priceNegotiable ?? true,
    depositAmount: pricing.depositAmount,
    paymentTerms: pricing.paymentTerms,
    taxIncluded: pricing.taxIncluded ?? false,
  };
}

/**
 * Transform property details with defaults
 */
function transformDetails(details: Partial<PropertyDetailsDto> = {}): PropertyDetailsDto {
  const currentYear = new Date().getFullYear();
  
  return {
    bedrooms: details.bedrooms ?? 0,
    bathrooms: details.bathrooms ?? 0,
    totalRooms: details.totalRooms ?? 0,
    totalArea: details.totalArea ?? 0,
    lotSize: details.lotSize,
    floorNumber: details.floorNumber ?? 0,
    totalFloors: details.totalFloors ?? 0,
    yearBuilt: details.yearBuilt ?? currentYear,
    parkingSpaces: details.parkingSpaces ?? 0,
    waterSource: details.waterSource,
    electricityStatus: details.electricityStatus,
    description: details.description || '',
    descriptionAm: details.descriptionAm || '',
    hasGuardHouse: details.hasGuardHouse ?? false,
    internetReady: details.internetReady ?? false,
  };
}

/**
 * Transform environmental info with defaults
 */
function transformEnvironmentalInfo(envInfo: Partial<EnvironmentalInfoDto> = {}): EnvironmentalInfoDto {
  return {
    walkScore: envInfo.walkScore ?? 50,
    bikeScore: envInfo.bikeScore ?? 50,
    transitScore: envInfo.transitScore ?? 50,
    roadSafety: envInfo.roadSafety ?? 50,
    floodRisk: envInfo.floodRisk ?? 50,
    noiseLevel: envInfo.noiseLevel ?? 50,
    airQuality: envInfo.airQuality ?? 50,
  };
}

/**
 * Transform nearby places with type coercion
 */
function transformNearbyPlaces(places: any[] = []): Array<{ name: string; type: string; distance: number }> {
  return places
    .filter(place => place?.name && place?.type) // Remove incomplete entries
    .map(place => ({
      name: place.name,
      type: place.type,
      distance: Number(place.distance) || 0, // Coerce to number
    }));
}

/**
 * Ensure enum value is uppercase
 * Handles both already-uppercase and lowercase inputs
 */
export function ensureUppercase(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const uppercased = value.toUpperCase();
  
  // Validate it's a known enum value
  if (value === uppercased) {
    return value; // Already uppercase
  }
  
  // Return uppercase version (frontend sends lowercase)
  return uppercased;
}

/**
 * Transform backend API response to frontend form values
 * Reverse of transformFormToBackendPayload
 */
export function transformBackendToFormValues(backendData: any): PropertyFormValuesDto {
  // Extract nested property data
  const property = backendData.data || backendData;
  
  return {
    id: property.id,
    title: property.title || '',
    titleAm: property.titleAm || '',
    
    // Enum values from backend (already uppercase)
    category: property.category || property.type || 'APARTMENT',
    listingType: property.listingType || 'SALE',
    status: property.status || 'DRAFT',
    
    // Location handling - could be nested or flat
    location: {
      region: property.location?.region || property.region,
      city: property.location?.city || property.city,
      subCity: property.location?.subCity || property.subCity,
      woreda: property.location?.woreda || property.woreda,
      kebele: property.location?.kebele || property.kebele,
      areaName: property.location?.areaName || property.areaName,
      address: property.location?.address || property.address,
      addressAm: property.location?.addressAm || property.addressAm,
      latitude: property.location?.latitude ?? property.latitude,
      longitude: property.location?.longitude ?? property.longitude,
      showExactLocation: property.location?.showExactLocation ?? property.showExactLocation ?? false,
    },
    
    // Pricing handling
    pricing: {
      price: property.pricing?.price ?? property.price ?? 0,
      currency: property.pricing?.currency ?? property.currency ?? CURRENCIES.ETB,
      priceNegotiable: property.pricing?.priceNegotiable ?? property.negotiable ?? true,
      depositAmount: property.pricing?.depositAmount ?? property.depositAmount,
      paymentTerms: property.pricing?.paymentTerms ?? property.paymentTerms,
      taxIncluded: property.pricing?.taxIncluded ?? property.includesVAT ?? false,
    },
    
    // Details handling
    details: {
      bedrooms: property.details?.bedrooms ?? property.bedrooms ?? 0,
      bathrooms: property.details?.bathrooms ?? property.bathrooms ?? 0,
      totalRooms: property.details?.totalRooms ?? property.totalRooms ?? 0,
      totalArea: property.details?.totalArea ?? property.area ?? 0,
      lotSize: property.details?.lotSize ?? property.lotSize,
      floorNumber: property.details?.floorNumber ?? property.floorNumber ?? 0,
      totalFloors: property.details?.totalFloors ?? property.totalFloors ?? 0,
      yearBuilt: property.details?.yearBuilt ?? property.yearBuilt ?? new Date().getFullYear(),
      parkingSpaces: property.details?.parkingSpaces ?? property.parkingSpaces ?? 0,
      waterSource: property.details?.waterSource ?? property.waterSource,
      electricityStatus: property.details?.electricityStatus ?? property.electricityStatus,
      description: property.details?.description ?? property.description ?? '',
      descriptionAm: property.details?.descriptionAm ?? property.descriptionAm ?? '',
      hasGuardHouse: property.details?.hasGuardHouse ?? property.hasGuardHouse ?? false,
      internetReady: property.details?.internetReady ?? property.internetReady ?? false,
    },
    
    // Environmental info
    environmentalInfo: {
      walkScore: property.environmentalInfo?.walkScore ?? 50,
      bikeScore: property.environmentalInfo?.bikeScore ?? 50,
      transitScore: property.environmentalInfo?.transitScore ?? 50,
      roadSafety: property.environmentalInfo?.roadSafety ?? 50,
      floodRisk: property.environmentalInfo?.floodRisk ?? 50,
      noiseLevel: property.environmentalInfo?.noiseLevel ?? 50,
      airQuality: property.environmentalInfo?.airQuality ?? 50,
    },
    
    // Arrays
    amenities: property.amenities || [],
    nearbyPlaces: transformBackendNearbyPlaces(property.nearbyPlaces),
    
    // Metadata
    metaTitle: property.metaTitle || '',
    metaDescription: property.metaDescription || '',
    keywords: property.keywords || [],
    tags: property.tags || [],
    featuredUntil: property.featuredUntil || '',
    
    // Relations
    agentId: property.agentId || property.agent?.id || '',
    
    // Timestamps
    publishedAt: property.publishedAt,
    approvedAt: property.approvedAt,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}

/**
 * Transform backend nearby places to form shape
 */
function transformBackendNearbyPlaces(places: any[]): any[] {
  if (!Array.isArray(places)) return [];
  
  return places.map(place => ({
    id: place.id,
    name: place.name,
    type: place.type,
    distance: Number(place.distance) || 0,
  }));
}

/**
 * Create form patch for partial updates
 * Only includes changed fields
 */
export function createFormPatch(original: PropertyFormValuesDto, current: PropertyFormValuesDto): Partial<BackendPropertyPayload> {
  const patch: Partial<BackendPropertyPayload> = {};
  
  // Check each top-level field
  if (original.title !== current.title) patch.title = current.title;
  if (original.titleAm !== current.titleAm) patch.titleAm = current.titleAm;
  if (original.category !== current.category) patch.category = ensureUppercase(current.category);
  if (original.listingType !== current.listingType) patch.listingType = ensureUppercase(current.listingType);
  if (original.status !== current.status) patch.status = current.status ? ensureUppercase(current.status) : undefined;
  
  // Deep comparison for nested objects would require more complex logic
  // For now, always include nested objects if anything might have changed
  if (JSON.stringify(original.location) !== JSON.stringify(current.location)) {
    patch.location = transformLocation(current.location);
  }
  if (JSON.stringify(original.pricing) !== JSON.stringify(current.pricing)) {
    patch.pricing = transformPricing(current.pricing);
  }
  if (JSON.stringify(original.details) !== JSON.stringify(current.details)) {
    patch.details = transformDetails(current.details);
  }
  if (JSON.stringify(original.environmentalInfo) !== JSON.stringify(current.environmentalInfo)) {
    patch.environmentalInfo = transformEnvironmentalInfo(current.environmentalInfo);
  }
  if (JSON.stringify(original.amenities) !== JSON.stringify(current.amenities)) {
    patch.amenities = current.amenities;
  }
  if (JSON.stringify(original.nearbyPlaces) !== JSON.stringify(current.nearbyPlaces)) {
    patch.nearbyPlaces = transformNearbyPlaces(current.nearbyPlaces);
  }
  if (original.metaTitle !== current.metaTitle) patch.metaTitle = current.metaTitle;
  if (original.metaDescription !== current.metaDescription) patch.metaDescription = current.metaDescription;
  if (JSON.stringify(original.keywords) !== JSON.stringify(current.keywords)) patch.keywords = current.keywords;
  if (original.agentId !== current.agentId) patch.agentId = current.agentId;
  if (original.featuredUntil !== current.featuredUntil) patch.featuredUntil = current.featuredUntil;
  
  return patch;
}

/**
 * Validate enum value exists in enum set
 */
export function isValidEnumValue(value: string, enumValues: Record<string, string>): boolean {
  return Object.values(enumValues).includes(value);
}

/**
 * Get all valid enum values for a field
 */
export function getEnumValues(enumObj: Record<string, string>): string[] {
  return Object.values(enumObj);
}

/**
 * Format enum value for display
 */
export function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
