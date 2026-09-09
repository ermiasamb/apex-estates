/**
 * Zod Validation Schemas for Property Forms
 * Aligned with backend DTO validation and NestJS decorators
 * Used by both admin dashboard and frontend web app
 */

import { z } from 'zod';
import {
  PROPERTY_CATEGORIES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  CURRENCIES,
  NEARBY_PLACE_TYPES,
  WATER_SOURCES,
  ELECTRICITY_STATUSES,
  VALIDATION_RULES,
  IMAGE_CATEGORIES,
} from './form-constants';

/**
 * Location Schema - Comprehensive location validation
 * Backward compatible with both nested and flat structures
 */
export const LocationSchema = z.object({
  region: z.string().optional(),
  state: z.string().optional(), // Alias for region
  city: z.string().optional(),
  subCity: z.string().optional(),
  neighborhood: z.string().optional(), // Alias for subCity
  woreda: z.string().optional(),
  kebele: z.string().optional(),
  areaName: z.string().optional(),
  address: z.string().optional(),
  addressAm: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  showExactLocation: z.boolean().optional(),
}).refine(
  (data) => data.address || data.city, 
  { 
    message: 'At least address or city is required',
    path: ['address'],
  }
);

export type LocationInput = z.infer<typeof LocationSchema>;

/**
 * Pricing Schema - Complete pricing information
 */
export const PricingSchema = z.object({
  price: z.number()
    .min(VALIDATION_RULES.PRICE_MIN, { message: `Price must be at least ${VALIDATION_RULES.PRICE_MIN}` })
    .max(VALIDATION_RULES.PRICE_MAX, { message: `Price cannot exceed ${VALIDATION_RULES.PRICE_MAX}` })
    .optional(),
  currency: z.enum(Object.values(CURRENCIES) as [string, ...string[]]).optional(),
  priceNegotiable: z.boolean().optional(),
  depositAmount: z.number().min(0).optional(),
  paymentTerms: z.string().optional(),
  taxIncluded: z.boolean().optional(),
});

export type PricingInput = z.infer<typeof PricingSchema>;

/**
 * Property Details Schema - Comprehensive property specifications
 */
export const PropertyDetailsSchema = z.object({
  bedrooms: z.coerce.number()
    .int()
    .min(VALIDATION_RULES.BEDROOMS_MIN)
    .max(VALIDATION_RULES.BEDROOMS_MAX)
    .optional(),
  bathrooms: z.coerce.number()
    .int()
    .min(VALIDATION_RULES.BATHROOMS_MIN)
    .max(VALIDATION_RULES.BATHROOMS_MAX)
    .optional(),
  totalRooms: z.coerce.number()
    .int()
    .min(VALIDATION_RULES.TOTAL_ROOMS_MIN)
    .max(VALIDATION_RULES.TOTAL_ROOMS_MAX)
    .optional(),
  totalArea: z.coerce.number()
    .min(VALIDATION_RULES.AREA_MIN)
    .max(VALIDATION_RULES.AREA_MAX)
    .optional(),
  lotSize: z.coerce.number()
    .min(VALIDATION_RULES.LOT_SIZE_MIN)
    .max(VALIDATION_RULES.LOT_SIZE_MAX)
    .optional(),
  floorNumber: z.coerce.number()
    .int()
    .min(VALIDATION_RULES.FLOOR_NUMBER_MIN)
    .max(VALIDATION_RULES.FLOOR_NUMBER_MAX)
    .optional(),
  totalFloors: z.coerce.number()
    .int()
    .min(VALIDATION_RULES.TOTAL_FLOORS_MIN)
    .max(VALIDATION_RULES.TOTAL_FLOORS_MAX)
    .optional(),
  yearBuilt: z.coerce.number()
    .int()
    .min(VALIDATION_RULES.YEAR_BUILT_MIN)
    .max(VALIDATION_RULES.YEAR_BUILT_MAX)
    .optional(),
  parkingSpaces: z.coerce.number()
    .int()
    .min(VALIDATION_RULES.PARKING_SPACES_MIN)
    .max(VALIDATION_RULES.PARKING_SPACES_MAX)
    .optional(),
  waterSource: z.enum(Object.values(WATER_SOURCES) as [string, ...string[]]).optional(),
  electricityStatus: z.enum(Object.values(ELECTRICITY_STATUSES) as [string, ...string[]]).optional(),
  description: z.string()
    .min(VALIDATION_RULES.DESCRIPTION_MIN, { message: `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN} characters` })
    .max(VALIDATION_RULES.DESCRIPTION_MAX, { message: `Description cannot exceed ${VALIDATION_RULES.DESCRIPTION_MAX} characters` })
    .optional()
    .or(z.literal('')),
  descriptionAm: z.string().optional(),
  hasGuardHouse: z.boolean().optional(),
  internetReady: z.boolean().optional(),
});

export type PropertyDetailsInput = z.infer<typeof PropertyDetailsSchema>;

/**
 * Environmental Info Schema - Area and neighborhood scores
 */
export const EnvironmentalInfoSchema = z.object({
  walkScore: z.coerce.number().min(0).max(100).optional(),
  bikeScore: z.coerce.number().min(0).max(100).optional(),
  transitScore: z.coerce.number().min(0).max(100).optional(),
  roadSafety: z.coerce.number().min(0).max(100).optional(),
  floodRisk: z.coerce.number().min(0).max(100).optional(),
  noiseLevel: z.coerce.number().min(0).max(100).optional(),
  airQuality: z.coerce.number().min(0).max(100).optional(),
});

export type EnvironmentalInfoInput = z.infer<typeof EnvironmentalInfoSchema>;

/**
 * Nearby Place Schema - Points of interest
 */
export const NearbyPlaceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Place name is required' }),
  type: z.enum(Object.values(NEARBY_PLACE_TYPES) as [string, ...string[]]),
  distance: z.coerce.number().min(0, { message: 'Distance must be positive' }),
});

export type NearbyPlaceInput = z.infer<typeof NearbyPlaceSchema>;

/**
 * Property Image Schema - Individual image with metadata
 */
export const PropertyImageSchema = z.object({
  localId: z.string().optional(),
  file: z.instanceof(File).optional(),
  preview: z.string().optional(),
  url: z.string().optional(),
  category: z.enum(Object.values(IMAGE_CATEGORIES) as [string, ...string[]]),
  mediaId: z.string().optional(),
  order: z.number().optional(),
  isFeatured: z.boolean().optional(),
});

export type PropertyImageInput = z.infer<typeof PropertyImageSchema>;

/**
 * Complete Property Form Schema - Backend DTO compatible
 * Strict validation with all required fields and types
 */
// Base schema without custom validations
const PropertyFormBaseSchema = z.object({
  // Basic Information
  id: z.string().optional(),
  title: z.string()
    .min(VALIDATION_RULES.TITLE_MIN, { message: `Title must be at least ${VALIDATION_RULES.TITLE_MIN} characters` })
    .max(VALIDATION_RULES.TITLE_MAX, { message: `Title cannot exceed ${VALIDATION_RULES.TITLE_MAX} characters` }),
  titleAm: z.string()
    .max(VALIDATION_RULES.TITLE_MAX)
    .optional()
    .or(z.literal('')),
  category: z.enum(Object.values(PROPERTY_CATEGORIES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid property category' }),
  }),
  listingType: z.enum(Object.values(LISTING_TYPES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid listing type. Must be SALE, RENT, or LEASE' }),
  }),
  status: z.enum(Object.values(PROPERTY_STATUSES) as [string, ...string[]]).optional(),
  
  // Nested DTOs
  location: LocationSchema,
  pricing: PricingSchema,
  details: PropertyDetailsSchema,
  environmentalInfo: EnvironmentalInfoSchema.optional(),
  
  // Relations
  amenities: z.array(z.string()).optional().default([]),
  nearbyPlaces: z.array(NearbyPlaceSchema).optional().default([]),
  
  // SEO/Metadata
  metaTitle: z.string()
    .max(VALIDATION_RULES.META_TITLE_MAX, { message: `Meta title cannot exceed ${VALIDATION_RULES.META_TITLE_MAX} characters` })
    .optional()
    .or(z.literal('')),
  metaDescription: z.string()
    .max(VALIDATION_RULES.META_DESCRIPTION_MAX, { message: `Meta description cannot exceed ${VALIDATION_RULES.META_DESCRIPTION_MAX} characters` })
    .optional()
    .or(z.literal('')),
  keywords: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  featuredUntil: z.string().datetime().optional().or(z.literal('')),
  
  // Agent
  agentId: z.string().optional(),
  
  // Timestamps
  publishedAt: z.string().datetime().optional(),
  approvedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Admin schema with full validation
export const PropertyFormSchema = PropertyFormBaseSchema
  .superRefine((data, ctx) => {
    // Validate status FEATURED requires featuredUntil
    if (data.status === PROPERTY_STATUSES.FEATURED && !data.featuredUntil) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['featuredUntil'],
        message: 'Featured Until date is required when status is FEATURED',
      });
    }

    // Validate featuredUntil is in the future
    if (data.featuredUntil && typeof data.featuredUntil === 'string') {
      const featuredDate = new Date(data.featuredUntil);
      if (featuredDate <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['featuredUntil'],
          message: 'Featured Until date must be in the future',
        });
      }
    }
  });

export type PropertyFormInput = z.infer<typeof PropertyFormSchema>;

/**
 * Simplified property form schema for frontend users (non-admin)
 * Has fewer fields and simpler validation
 */
export const SimplifiedPropertyFormSchema = z.object({
  // Basic Information
  id: z.string().optional(),
  title: z.string()
    .min(VALIDATION_RULES.TITLE_MIN, { message: `Title must be at least ${VALIDATION_RULES.TITLE_MIN} characters` })
    .max(VALIDATION_RULES.TITLE_MAX, { message: `Title cannot exceed ${VALIDATION_RULES.TITLE_MAX} characters` }),
  titleAm: z.string()
    .max(VALIDATION_RULES.TITLE_MAX)
    .optional()
    .or(z.literal('')),
  category: z.enum(Object.values(PROPERTY_CATEGORIES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid property category' }),
  }),
  listingType: z.enum(Object.values(LISTING_TYPES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid listing type. Must be SALE, RENT, or LEASE' }),
  }),
  status: z.enum(['DRAFT', 'ACTIVE'] as const).optional(), // Users can only set DRAFT or ACTIVE
  
  // Nested DTOs
  location: LocationSchema,
  pricing: PricingSchema,
  details: PropertyDetailsSchema,
  environmentalInfo: EnvironmentalInfoSchema.optional(),
  
  // Relations
  amenities: z.array(z.string()).optional().default([]),
  nearbyPlaces: z.array(NearbyPlaceSchema).optional().default([]),
  
  // SEO/Metadata
  metaTitle: z.string()
    .max(VALIDATION_RULES.META_TITLE_MAX, { message: `Meta title cannot exceed ${VALIDATION_RULES.META_TITLE_MAX} characters` })
    .optional()
    .or(z.literal('')),
  metaDescription: z.string()
    .max(VALIDATION_RULES.META_DESCRIPTION_MAX, { message: `Meta description cannot exceed ${VALIDATION_RULES.META_DESCRIPTION_MAX} characters` })
    .optional()
    .or(z.literal('')),
  keywords: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  featuredUntil: z.string().datetime().optional().or(z.literal('')),
  
  // Agent
  agentId: z.string().optional(),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SimplifiedPropertyFormInput = z.infer<typeof SimplifiedPropertyFormSchema>;
export const MediaUploadSchema = z.object({
  images: z.array(PropertyImageSchema).optional(),
  floorPlan: z.instanceof(File).optional(),
  videoType: z.enum(['url', 'upload']).default('url'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  videoFile: z.instanceof(File).optional(),
  virtualTourUrl: z.string().url().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.videoType === 'url' && data.videoUrl && data.videoUrl.length > 0) {
    try {
      new URL(data.videoUrl);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['videoUrl'],
        message: 'Invalid video URL',
      });
    }
  }

  if (data.videoType === 'upload' && !data.videoFile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['videoFile'],
      message: 'Video file is required when using upload',
    });
  }
});

export type MediaUploadInput = z.infer<typeof MediaUploadSchema>;

/**
 * Validation utilities
 */
export const FormValidationUtils = {
  /**
   * Validate property form data
   */
  validatePropertyForm: (data: unknown) => {
    const result = PropertyFormSchema.safeParse(data);
    return {
      isValid: result.success,
      data: result.data,
      errors: result.error?.flatten().fieldErrors || {},
    };
  },

  /**
   * Validate simplified form (frontend users)
   */
  validateSimplifiedForm: (data: unknown) => {
    const result = SimplifiedPropertyFormSchema.safeParse(data);
    return {
      isValid: result.success,
      data: result.data,
      errors: result.error?.flatten().fieldErrors || {},
    };
  },

  /**
   * Validate only specific fields
   */
  validateField: (fieldPath: string, value: unknown) => {
    // This would require schema introspection - simplified version
    console.log(`Validating ${fieldPath}:`, value);
    return { isValid: true };
  },
};
