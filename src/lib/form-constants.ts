/**
 * Shared Form Constants and Enums
 * Aligned with backend DTO validation and database schema
 */

// Property Categories - Backend enum values (UPPERCASE)
export const PROPERTY_CATEGORIES = {
  APARTMENT: 'APARTMENT',
  CONDOMINIUM: 'CONDOMINIUM',
  CONDO: 'CONDO',
  VILLA: 'VILLA',
  HOUSE: 'HOUSE',
  TOWNHOUSE: 'TOWNHOUSE',
  STUDIO: 'STUDIO',
  PENTHOUSE: 'PENTHOUSE',
  DUPLEX: 'DUPLEX',
  OFFICE: 'OFFICE',
  RETAIL: 'RETAIL',
  WAREHOUSE: 'WAREHOUSE',
  INDUSTRIAL: 'INDUSTRIAL',
  SHOP: 'SHOP',
  RESTAURANT: 'RESTAURANT',
  HOTEL: 'HOTEL',
  LAND: 'LAND',
  LAND_PLOT: 'LAND_PLOT',
  PLOT: 'PLOT',
  FARM: 'FARM',
  FACTORY: 'FACTORY',
} as const;

export type PropertyCategory = typeof PROPERTY_CATEGORIES[keyof typeof PROPERTY_CATEGORIES];

export const PROPERTY_CATEGORY_OPTIONS = Object.values(PROPERTY_CATEGORIES).map(value => ({
  value,
  label: value.replace(/_/g, ' '),
}));

// Listing Types - Backend enum values (UPPERCASE)
export const LISTING_TYPES = {
  SALE: 'SALE',
  RENT: 'RENT',
  LEASE: 'LEASE',
} as const;

export type ListingType = typeof LISTING_TYPES[keyof typeof LISTING_TYPES];

export const LISTING_TYPE_OPTIONS = Object.values(LISTING_TYPES).map(value => ({
  value,
  label: value,
}));

// Property Status - Backend enum values (UPPERCASE)
export const PROPERTY_STATUSES = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  FEATURED: 'FEATURED',
  UNDER_CONTRACT: 'UNDER_CONTRACT',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  RENTED: 'RENTED',
  EXPIRED: 'EXPIRED',
  ARCHIVED: 'ARCHIVED',
  REJECTED: 'REJECTED',
} as const;

export type PropertyStatus = typeof PROPERTY_STATUSES[keyof typeof PROPERTY_STATUSES];

export const PROPERTY_STATUS_OPTIONS = [
  { value: PROPERTY_STATUSES.DRAFT, label: 'Draft' },
  { value: PROPERTY_STATUSES.PENDING_APPROVAL, label: 'Pending Approval' },
  { value: PROPERTY_STATUSES.ACTIVE, label: 'Active' },
  { value: PROPERTY_STATUSES.FEATURED, label: 'Featured' },
  { value: PROPERTY_STATUSES.RESERVED, label: 'Reserved' },
  { value: PROPERTY_STATUSES.SOLD, label: 'Sold' },
  { value: PROPERTY_STATUSES.RENTED, label: 'Rented' },
  { value: PROPERTY_STATUSES.EXPIRED, label: 'Expired' },
  { value: PROPERTY_STATUSES.ARCHIVED, label: 'Archived' },
  { value: PROPERTY_STATUSES.REJECTED, label: 'Rejected' },
];

// Currencies - Backend supports multiple currencies
export const CURRENCIES = {
  ETB: 'ETB',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  AED: 'AED',
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

export const CURRENCY_OPTIONS = Object.entries(CURRENCIES).map(([_, value]) => ({
  value,
  label: value,
}));

// Image Categories for media uploads
export const IMAGE_CATEGORIES = {
  EXTERIOR: 'exterior',
  INTERIOR: 'interior',
  LIVING_ROOM: 'living-room',
  KITCHEN: 'kitchen',
  BEDROOM: 'bedroom',
  BATHROOM: 'bathroom',
  FLOOR_PLAN: 'plan',
} as const;

export type ImageCategory = typeof IMAGE_CATEGORIES[keyof typeof IMAGE_CATEGORIES];

export const IMAGE_CATEGORY_OPTIONS = [
  { value: IMAGE_CATEGORIES.EXTERIOR, label: 'Exterior' },
  { value: IMAGE_CATEGORIES.INTERIOR, label: 'Interior' },
  { value: IMAGE_CATEGORIES.LIVING_ROOM, label: 'Living Room' },
  { value: IMAGE_CATEGORIES.KITCHEN, label: 'Kitchen' },
  { value: IMAGE_CATEGORIES.BEDROOM, label: 'Bedroom' },
  { value: IMAGE_CATEGORIES.BATHROOM, label: 'Bathroom' },
  { value: IMAGE_CATEGORIES.FLOOR_PLAN, label: 'Floor Plan' },
];

// Nearby Place Types - Backend accepts any string, but these are standard types
export const NEARBY_PLACE_TYPES = {
  HOSPITAL: 'hospital',
  SCHOOL: 'school',
  RESTAURANT: 'restaurant',
  CHURCH: 'church',
  PLAYGROUND: 'playground',
  TRANSPORT: 'transport',
  GYM: 'gym',
  SPA: 'spa',
  MALL: 'mall',
  MARKET: 'market',
  BANK: 'bank',
  PARK: 'park',
  LIBRARY: 'library',
  PHARMACY: 'pharmacy',
} as const;

export type NearbyPlaceType = typeof NEARBY_PLACE_TYPES[keyof typeof NEARBY_PLACE_TYPES];

export const NEARBY_PLACE_TYPE_OPTIONS = Object.entries(NEARBY_PLACE_TYPES).map(([_, value]) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

// Water Sources - Backend enum
export const WATER_SOURCES = {
  MUNICIPAL: 'municipal',
  BOREHOLE: 'borehole',
  WELL: 'well',
  TANK: 'tank',
  SPRING: 'spring',
} as const;

export type WaterSource = typeof WATER_SOURCES[keyof typeof WATER_SOURCES];

export const WATER_SOURCE_OPTIONS = Object.entries(WATER_SOURCES).map(([_, value]) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

// Electricity Status - Backend enum
export const ELECTRICITY_STATUSES = {
  CONNECTED: 'connected',
  NOT_CONNECTED: 'not_connected',
  BACKUP_ONLY: 'backup_only',
} as const;

export type ElectricityStatus = typeof ELECTRICITY_STATUSES[keyof typeof ELECTRICITY_STATUSES];

export const ELECTRICITY_STATUS_OPTIONS = [
  { value: ELECTRICITY_STATUSES.CONNECTED, label: 'Connected' },
  { value: ELECTRICITY_STATUSES.NOT_CONNECTED, label: 'Not Connected' },
  { value: ELECTRICITY_STATUSES.BACKUP_ONLY, label: 'Backup Only' },
];

// Environmental Score Ranges
export const ENVIRONMENTAL_SCORE_CONFIG = {
  MIN: 0,
  MAX: 100,
  STEP: 1,
};

// Default coordinates (Addis Ababa center)
export const DEFAULT_COORDINATES = {
  lat: 9.021808,
  lng: 38.800203,
};

// Default location values
export const DEFAULT_LOCATION = {
  region: 'Addis Ababa',
  city: 'Addis Ababa',
  subCity: 'Bole',
  woreda: '01',
  kebele: '01',
  areaName: 'Bole',
  address: 'Addis Ababa',
};

// Amenities List - Extended from admin dashboard
export const AMENITIES_LIST = [
  'WiFi',
  'Parking',
  'Pet Friendly',
  'Balcony',
  'Kitchen',
  'Pool',
  'Generator Backup',
  'Gym',
  'Rooftop Deck',
  'Air Conditioning',
  'Heating',
  'Laundry',
  'Elevator',
  'Security System',
  'CCTV',
  'Guard House',
  'Furnished',
  'Unfurnished',
  'Semi-furnished',
  'Garden',
  'Terrace',
  'Basement',
  'Garage',
  'Internet Ready',
  'Water Tank',
  'Solar Panel',
  'Generator',
  'Playground',
  'Cafeteria',
  'Spa',
];

// Form Field Validation Rules
export const VALIDATION_RULES = {
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 5000,
  PRICE_MIN: 0,
  PRICE_MAX: 999999999,
  BEDROOMS_MIN: 0,
  BEDROOMS_MAX: 100,
  BATHROOMS_MIN: 0,
  BATHROOMS_MAX: 100,
  TOTAL_ROOMS_MIN: 0,
  TOTAL_ROOMS_MAX: 500,
  AREA_MIN: 0.1,
  AREA_MAX: 1000000,
  LOT_SIZE_MIN: 0.1,
  LOT_SIZE_MAX: 1000000,
  FLOOR_NUMBER_MIN: 0,
  FLOOR_NUMBER_MAX: 500,
  TOTAL_FLOORS_MIN: 1,
  TOTAL_FLOORS_MAX: 500,
  YEAR_BUILT_MIN: 1800,
  YEAR_BUILT_MAX: new Date().getFullYear() + 10,
  PARKING_SPACES_MIN: 0,
  PARKING_SPACES_MAX: 100,
  META_TITLE_MAX: 60,
  META_DESCRIPTION_MAX: 160,
  KEYWORDS_MAX: 500,
};
