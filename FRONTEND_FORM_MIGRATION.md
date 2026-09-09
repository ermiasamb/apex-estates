# Frontend Form Migration Guide

## Overview

The frontend AddListingForm component is being updated to:
1. Use shared form validation schemas from `/lib/form-schemas.ts`
2. Include all missing database fields
3. Properly convert enums (lowercase → UPPERCASE)
4. Align with backend DTO structure

## Changes Required in AddListingForm.tsx

### 1. Update Imports

**Before:**
```typescript
import { z } from 'zod';
const nearbyPlaceTypes = ['hospital', 'school', ...] as const;
const propertyCategories = ['apartment', 'condominium', ...] as const;
const formSchema = z.object({ /* manual schema */ });
```

**After:**
```typescript
import { SimplifiedPropertyFormSchema } from '@/lib/form-schemas';
import { NEARBY_PLACE_TYPES, PROPERTY_CATEGORIES, LISTING_TYPES } from '@/lib/form-constants';
import type { PropertyFormValuesDto } from '@/lib/form-types';
const formSchema = SimplifiedPropertyFormSchema;
```

### 2. New Form Fields to Add

#### Location Fields (Previously Missing)
```typescript
location: {
  region: string;      // Region/State
  city: string;        // City name
  subCity: string;     // District
  woreda: string;      // Administrative division
  kebele: string;      // Smallest division
  areaName: string;    // Neighborhood name
  addressAm: string;   // Address in Amharic
  showExactLocation: boolean;
}
```

#### Pricing Fields (Previously Missing)
```typescript
pricing: {
  depositAmount?: number;
  paymentTerms?: string;
  taxIncluded?: boolean;
}
```

#### Details Fields (Previously Missing)
```typescript
details: {
  totalRooms?: number;
  lotSize?: number;
  floorNumber?: number;
  totalFloors?: number;
  yearBuilt?: number;
  waterSource?: string;
  electricityStatus?: string;
  hasGuardHouse?: boolean;
  internetReady?: boolean;
  descriptionAm?: string;  // Amharic description
}
```

#### Environmental Fields (Previously Missing)
```typescript
environmentalInfo: {
  transitScore?: number;  // NEW
  airQuality?: number;    // NEW
  // existing: walkScore, bikeScore, roadSafety, floodRisk, noiseLevel
}
```

#### SEO/Metadata Fields (Previously Missing)
```typescript
metaTitle?: string;
metaDescription?: string;
keywords?: string[];
tags?: string[];
featuredUntil?: string;
titleAm?: string;
```

### 3. Form Structure

The form will be reorganized into logical sections:

1. **Basic Information**
   - title (English), titleAm (Amharic)
   - category, listingType, status
   - Agent/Broker selection

2. **Location Details**
   - Interactive map picker
   - Region, city, subCity, woreda, kebele, areaName
   - Full address (English & Amharic)
   - GPS coordinates
   - Show exact location toggle

3. **Financial Terms**
   - Price, currency, negotiable flag
   - Deposit amount, payment terms
   - Tax/VAT included flag

4. **Property Specifications**
   - Bedrooms, bathrooms, total rooms
   - Total area, lot size
   - Floor number, total floors, year built
   - Parking spaces, water source, electricity status
   - Guard house, internet ready flags

5. **Descriptions**
   - English description (required)
   - Amharic description (optional)

6. **Media**
   - Property images (with categories)
   - Floor plan
   - Video tour (URL or upload)
   - Virtual tour URL

7. **Amenities & Nearby Places**
   - Multi-select amenities (from API/constants)
   - Dynamic nearby places (add/remove)

8. **Environmental Scores**
   - All 7 scores (0-100): walk, bike, transit, safety, flood, noise, air quality

9. **SEO & Publishing**
   - Meta title, description
   - Keywords/tags
   - Featured until date (if featured)

### 4. Data Transformation

**Enum Conversion:**
```typescript
// Frontend form uses lowercase
formData.category = 'apartment'
formData.listingType = 'sale'

// Shared transformation handles conversion
const payload = transformFormToBackendPayload(formData);
// Result:
// payload.category = 'APARTMENT'
// payload.listingType = 'SALE'
```

**Pricing Structure:**
```typescript
// Frontend captures in form
pricing: {
  price: 50000,
  currency: 'ETB',  // Changed from hardcoded USD
  priceNegotiable: true,
  depositAmount: 5000,
  paymentTerms: 'Monthly in advance',
  taxIncluded: false
}

// Transforms to backend structure automatically
```

**Location Structure:**
```typescript
// All components captured
location: {
  region: 'Addis Ababa',
  city: 'Addis Ababa',
  subCity: 'Bole',
  woreda: '01',
  kebele: '01',
  areaName: 'Gerji Sunshine',
  address: '...',
  addressAm: '...',
  latitude: 9.021808,
  longitude: 38.800203,
  showExactLocation: false
}

// All data preserved in database
```

### 5. Validation Changes

**Before:**
```typescript
const formSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  type: z.enum(['sale', 'rent']),
  category: z.enum(['apartment', 'villa', ...]),
  // Missing fields not validated
});
```

**After:**
```typescript
// Uses SimplifiedPropertyFormSchema from shared lib
// Validates ALL fields
// Enum values validated as-is (case-insensitive)
// Custom refinements:
// - FEATURED status requires featuredUntil
// - featuredUntil must be future date
// - Distance values coerced to numbers
```

### 6. Implementation Steps

1. Update imports to use shared constants and schemas
2. Add new form sections for missing fields
3. Update form defaultValues to include all fields
4. Add new UI sections for location hierarchy, pricing details, etc.
5. Update form submission to use transformFormToBackendPayload()
6. Test enum conversion with console logs
7. Test distance field type coercion
8. Test location data persistence

### 7. Backward Compatibility

The changes maintain backward compatibility:
- Existing AddListingForm props still work
- initialValues can provide partial data
- API still returns same response format
- mapApiProperty() handles transformation

### 8. Testing Checklist

- [ ] Create property with all new fields
- [ ] Verify lowercase enums convert to UPPERCASE
- [ ] Verify location hierarchy preserved (region, subCity, etc.)
- [ ] Verify pricing fields sent to backend
- [ ] Verify all environmental scores captured
- [ ] Verify Amharic fields handled
- [ ] Verify SEO fields submitted
- [ ] Edit property with new fields
- [ ] Verify distance field is number in backend
- [ ] Compare admin and frontend field coverage

### 9. API Contract

**Request Body:**
```typescript
{
  title: string;
  titleAm?: string;
  category: 'APARTMENT' | 'VILLA' | ...;  // UPPERCASE
  listingType: 'SALE' | 'RENT' | 'LEASE';  // UPPERCASE
  location: {
    region?, city, subCity?, woreda?, kebele?, areaName?
    address, addressAm?
    latitude, longitude
    showExactLocation?
  };
  pricing: {
    price: number;
    currency: 'ETB' | 'USD' | ...;
    priceNegotiable?: boolean;
    depositAmount?: number;
    paymentTerms?: string;
    taxIncluded?: boolean;
  };
  details: {
    bedrooms, bathrooms, totalRooms?, totalArea
    lotSize?, floorNumber?, totalFloors?, yearBuilt?
    parkingSpaces?, waterSource?, electricityStatus?
    description, descriptionAm?
    hasGuardHouse?, internetReady?
  };
  environmentalInfo: {
    walkScore?, bikeScore?, transitScore?
    roadSafety?, floodRisk?, noiseLevel?, airQuality?
  };
  amenities?: string[];
  nearbyPlaces?: { name, type, distance (number) }[];
  metaTitle?, metaDescription?, keywords?, tags?
  agentId?;
}
```

## Migration Approach

### Phase 1: Prepare (DONE)
- Create shared schemas and constants
- Create transformation utilities
- Document field coverage

### Phase 2: Update Frontend Service (DONE)
- Update buildPropertyPayload() to use transformFormToBackendPayload()
- Update mapApiProperty() to use transformBackendToFormValues()
- Add validation to create/update operations

### Phase 3: Update AddListingForm Component (IN PROGRESS)
- Add new form fields
- Update schema to use SimplifiedPropertyFormSchema
- Test enum conversion
- Test all field submissions

### Phase 4: Test & Verify
- Test with admin dashboard
- Verify field coverage matches
- Verify enum handling
- Compare API requests

## Success Criteria

✅ All 40+ database fields captured in form
✅ Enums properly converted (lowercase → UPPERCASE)
✅ Location hierarchy fully captured
✅ Pricing details complete
✅ Environmental scores all captured
✅ SEO metadata captured
✅ Validation aligned with backend DTO
✅ Type safety with TypeScript
✅ No data loss in transformation
✅ Admin and frontend forms feature-parity
