# Property Form System Documentation

## Overview

The property form system has been completely refactored to provide:
- ✅ Type-safe form handling with TypeScript
- ✅ Comprehensive Zod validation aligned with backend DTO
- ✅ Shared models and validation across admin dashboard and frontend
- ✅ Automatic enum case conversion (lowercase → UPPERCASE)
- ✅ Bidirectional data transformation (frontend ↔ backend)
- ✅ Real-time field validation with error reporting
- ✅ Support for all database fields including those previously missing

## Architecture

### Shared Form Libraries (`src/lib/`)

All form-related files are shared between admin dashboard and frontend web app:

#### `form-constants.ts`
Centralized enum definitions and validation rules:
- **PROPERTY_CATEGORIES**: 21 property types (APARTMENT, VILLA, LAND, etc.)
- **LISTING_TYPES**: SALE, RENT, LEASE
- **PROPERTY_STATUSES**: 11 statuses (DRAFT, ACTIVE, FEATURED, SOLD, etc.)
- **CURRENCIES**: ETB, USD, EUR, GBP, AED
- **IMAGE_CATEGORIES**: 7 image types (exterior, interior, bedroom, etc.)
- **NEARBY_PLACE_TYPES**: 14 place types (hospital, school, restaurant, etc.)
- **WATER_SOURCES**: municipal, borehole, well, tank, spring
- **ELECTRICITY_STATUSES**: connected, not_connected, backup_only
- **AMENITIES_LIST**: 30+ amenities with category support
- **VALIDATION_RULES**: Min/max constraints for all fields

#### `form-types.ts`
Complete TypeScript DTOs and interfaces:

```typescript
// Nested DTOs for organized data structure
LocationDto          // Region, city, subCity, woreda, kebele, areaName, address, coordinates
PricingDto          // Price, currency, deposit, payment terms, tax
PropertyDetailsDto  // Bedrooms, bathrooms, rooms, area, utilities, amenities
EnvironmentalInfoDto // 7 environmental scores (0-100 scale)
NearbyPlaceDto      // Points of interest with distance
PropertyFormValuesDto // Master DTO combining all above

// Supporting types
PropertyMediaState  // Media upload state management
PropertyImageRow    // Individual image with metadata
FloorPlanRow        // Floor plan image tracking
ValidationError     // Error structure
FormSubmissionResult // API response format
```

#### `form-schemas.ts`
Zod validation schemas with custom refinements:

```typescript
// Component schemas
LocationSchema       // Validates all location fields
PricingSchema       // Validates pricing data
PropertyDetailsSchema // Validates property specifications
EnvironmentalInfoSchema // Validates environmental scores 0-100
NearbyPlaceSchema   // Validates nearby places
PropertyImageSchema // Validates image uploads

// Complete form schemas
PropertyFormSchema  // Full validation with custom rules:
                    // - Requires featuredUntil if status is FEATURED
                    // - Validates featuredUntil is in future
                    // - Enum value validation (UPPERCASE)

SimplifiedPropertyFormSchema // For non-admin users
                    // - Limited status options (DRAFT, ACTIVE only)
                    // - Simpler validation rules

MediaUploadSchema   // Validates media uploads with conditional logic
```

#### `form-transform.ts`
Data transformation utilities:

```typescript
// Frontend → Backend
transformFormToBackendPayload(formValues)
  // Converts form shape to backend DTO structure
  // Handles enum uppercasing: 'apartment' → 'APARTMENT'
  // Field name mapping: area → totalArea
  // Type coercion: distance string → number
  // Location alias handling: state → region
  // Default value application
  // Data restructuring for nested objects

// Backend → Frontend
transformBackendToFormValues(apiResponse)
  // Normalizes backend response to form shape
  // Handles flat and nested structures
  // Preserves enum values (already uppercase)
  // Comprehensive field mapping
  // Fallback handling for missing fields

// Utilities
ensureUppercase(value)              // Enum case conversion
createFormPatch(original, current)  // Detect changed fields
isValidEnumValue(value, enumObj)    // Enum validation
getEnumValues(enumObj)              // Extract enum values
formatEnumValue(value)              // Format for display
```

### Admin Dashboard (`src/pages/properties/`)

#### `property-form-utils.ts` (UPDATED)
Integration layer for admin dashboard:

```typescript
emptyPropertyForm()
  // Creates default form values
  // Returns PropertyFormValuesDto with sensible defaults

propertyToForm(apiResponse)
  // Transforms backend response to form shape
  // Uses transformBackendToFormValues()
  // Handles status derivation (FEATURED logic)

validatePropertyForm(formData)
  // Validates form using Zod schema
  // Returns { isValid, errors, data }

formToApiPayload(formData, isEdit)
  // Transforms form to API request body
  // Uses transformFormToBackendPayload()
  // Handles FEATURED status logic on edit
```

#### `property-form-types.ts` (UPDATED)
Re-exports shared types for backward compatibility:

```typescript
export type PropertyFormValues = PropertyFormValuesDto
export type NearbyPlaceRow = NearbyPlaceDto
export type EnvironmentalInfoForm = EnvironmentalInfoDto
// etc.
```

#### `property-service.ts` (NEW)
Unified service layer with validation:

```typescript
fetchProperty(propertyId)          // Get single property
fetchProperties(filters)           // List properties with filters
createProperty(formData)           // Create with validation
updateProperty(propertyId, formData) // Update with validation
deleteProperty(propertyId)         // Delete property
updatePropertyStatus(propertyId, status) // Status change
approveProperty(propertyId)        // Admin approval
rejectProperty(propertyId, reason) // Admin rejection
getPropertyStats()                 // Fetch statistics
exportProperties(format)           // Batch export
```

#### `usePropertyFormValidation.ts` (NEW)
React Hook for form validation:

```typescript
const {
  isValid,
  errors,
  errorCount,
  validateForm,
  validateField,
  clearErrors,
  getFieldError,
  hasFieldError,
} = usePropertyFormValidation();

// Usage in component:
const handleSubmit = async (e) => {
  if (!validateForm(formData)) {
    // Show errors
    return;
  }
  // Submit form
};
```

#### `FormFieldError.tsx` (NEW)
UI components for error display:

```typescript
// Display single field error
<FormFieldError error={errors.title} />

// Display section error summary
<FormSectionErrors 
  errors={locationErrors}
  title="Location Errors"
/>

// Display validation banner
<ValidationBanner 
  isValid={validation.isValid}
  errorCount={validation.errorCount}
/>
```

## Data Flow

### Create Property Flow

```
1. User fills form in PropertyForm.tsx
2. Form state managed with useState hooks
3. User submits form
4. validatePropertyForm() called
   ↓ If invalid, display errors and stop
5. formToApiPayload() transforms to backend format
   - Lowercase enums → UPPERCASE
   - Field names mapped to backend schema
   - Data restructured to nested objects
6. POST /properties API call
7. Backend validates with NestJS DTO validators
8. Response transformed with transformBackendToFormValues()
9. Success notification and navigation
```

### Edit Property Flow

```
1. PropertyEdit component mounts with propertyId
2. fetchProperty() called
3. transformBackendToFormValues() converts API response
4. Form populated with existing data
5. User modifies fields
6. validatePropertyForm() on submit
7. formToApiPayload() transforms (with isEdit=true)
   - FEATURED status handling
8. PUT /properties/{id} API call
9. Media synced if changed
10. Success notification
```

### Validation Flow

```
1. validatePropertyForm(formData) called
2. PropertyFormSchema.safeParse(formData) executes
3. Zod validates:
   - Field types and ranges
   - Required vs optional
   - Enum values (UPPERCASE)
   - Custom refinements:
     * FEATURED requires featuredUntil
     * featuredUntil must be future date
   - Nested object validation
4. If errors, flatten to field-level errors
5. Return { isValid, errors, data }
```

## Field Coverage

### Now Captured (Previously Missing)

All 40+ fields from backend DTO are now captured:

**Location Fields**
- ✅ region, city, subCity, woreda, kebele, areaName
- ✅ address, addressAm (Amharic)
- ✅ latitude, longitude, showExactLocation

**Pricing Fields**
- ✅ price, currency, priceNegotiable
- ✅ depositAmount, paymentTerms, taxIncluded

**Details Fields**
- ✅ bedrooms, bathrooms, totalRooms, totalArea
- ✅ lotSize, floorNumber, totalFloors, yearBuilt
- ✅ parkingSpaces, waterSource, electricityStatus
- ✅ description, descriptionAm, hasGuardHouse, internetReady

**Environmental Fields**
- ✅ walkScore, bikeScore, transitScore (NEW)
- ✅ roadSafety, floodRisk, noiseLevel, airQuality (NEW)

**SEO/Metadata Fields**
- ✅ metaTitle, metaDescription, keywords
- ✅ tags, featuredUntil

**Relations**
- ✅ amenities (dynamic, API-driven)
- ✅ nearbyPlaces (dynamic with add/remove)
- ✅ agentId (agent assignment)

## Enum Handling

### Critical Conversion: Lowercase → UPPERCASE

Frontend sends lowercase, backend requires UPPERCASE:

```typescript
// User selects "apartment" in dropdown
formData.category = 'apartment'

// Before API call:
transformFormToBackendPayload(formData)
// Result:
payload.category = 'APARTMENT'  // ✅ Correct

// Without conversion:
// API would reject with validation error
```

### Supported Enum Values

All values stored in constants:

```typescript
PROPERTY_CATEGORIES = {
  APARTMENT, CONDOMINIUM, VILLA, HOUSE, TOWNHOUSE,
  STUDIO, PENTHOUSE, DUPLEX, OFFICE, RETAIL,
  WAREHOUSE, LAND, LAND_PLOT, PLOT, FARM, FACTORY, // etc.
}

LISTING_TYPES = { SALE, RENT, LEASE }

PROPERTY_STATUSES = {
  DRAFT, PENDING_APPROVAL, ACTIVE, FEATURED,
  RESERVED, SOLD, RENTED, EXPIRED, ARCHIVED, REJECTED
}
```

## Integration with PropertyForm.tsx

### Current Implementation
PropertyForm.tsx uses manual state management with patch functions.

### To Use Zod Validation
1. Import `usePropertyFormValidation` hook
2. Initialize in component: `const validation = usePropertyFormValidation()`
3. On submit: Call `validation.validateForm(form)`
4. Display errors: Use `<FormFieldError error={validation.getFieldError('title')} />`

### Example Integration

```typescript
import { usePropertyFormValidation } from './usePropertyFormValidation';

function PropertyForm() {
  const validation = usePropertyFormValidation();
  const [form, setForm] = useState(emptyPropertyForm());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validation.validateForm(form)) {
      console.log('Validation errors:', validation.errors);
      return;
    }
    
    // Transform and submit
    try {
      const payload = formToApiPayload(form, isEdit);
      // API call
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ValidationBanner 
        isValid={validation.isValid}
        errorCount={validation.errorCount}
      />
      
      {/* Location section */}
      <div>
        <Input 
          value={form.location.address}
          onChange={(e) => setForm({
            ...form,
            location: { ...form.location, address: e.target.value }
          })}
        />
        <FormFieldError 
          error={validation.getFieldError('location.address')}
        />
      </div>
      
      {/* Other fields */}
    </form>
  );
}
```

## Frontend Web App Integration

The frontend (apex-estates) uses the same shared libraries:
- Imports from `src/lib/form-*` (same files)
- Uses `AddListingForm.tsx` with React Hook Form + Zod
- Calls `transformFormToBackendPayload()` before API submission
- Uses `transformBackendToFormValues()` for edit mode

## Backend Alignment

### Backend Validation (NestJS DTO Decorators)

```typescript
@IsEnum(PropertyCategoryDto)  // Validates: UPPERCASE enum values
@IsEnum(ListingTypeDto)
@ValidateNested()             // Nested object validation
@Type(() => LocationDto)      // Type transformation
@IsNumber() @Min(0) @Max(100) // Score validation
```

### Frontend Validation (Zod Schemas)

Mirrors backend validation:
```typescript
category: z.enum(Object.values(PROPERTY_CATEGORIES))
listingType: z.enum(Object.values(LISTING_TYPES))
// Location, pricing, details are validated per schema
environmentalInfo: z.object({
  walkScore: z.number().min(0).max(100),
  // etc.
})
```

## Testing Checklist

- [ ] Create new property with all fields
- [ ] Edit existing property
- [ ] Validate enum case conversion (lowercase → UPPERCASE)
- [ ] Validate distance field type coercion (string → number)
- [ ] Validate FEATURED status requires featuredUntil
- [ ] Validate featured date must be future
- [ ] Test location hierarchy (region, city, subCity, etc.)
- [ ] Test amenities array handling
- [ ] Test nearby places add/remove
- [ ] Test environmental scores 0-100 validation
- [ ] Test media upload with categorization
- [ ] Test error display on validation failure
- [ ] Test form submission with all fields populated
- [ ] Test edit mode with existing data
- [ ] Compare admin and frontend field coverage

## Migration Guide

### For Admin Dashboard

If you need to update PropertyForm.tsx to use new validation:

1. Import the validation hook
2. Add validation state management
3. Call validateForm() before submission
4. Display errors using FormFieldError component
5. No changes needed to form structure or layout

### For Frontend Web App

Frontend (apex-estates) already uses Zod validation. Updates needed:

1. Use shared constants from `form-constants.ts`
2. Use shared schemas from `form-schemas.ts`
3. Use shared transformation utilities from `form-transform.ts`
4. Update AddListingForm to capture all missing fields
5. Test enum conversions with new constants

## Troubleshooting

### Validation Errors on Submit

**Problem**: Form submission fails with validation errors

**Solutions**:
1. Check enum values are UPPERCASE in payload
2. Verify nested object structure matches DTO
3. Check required fields are not empty
4. Ensure numbers are actually numbers (not strings)
5. Verify date format is ISO 8601

### Enum Not Recognized

**Problem**: "Invalid enum value 'apartment'"

**Solution**: Use `ensureUppercase()` before sending to backend:
```typescript
const category = ensureUppercase(formData.category); // 'APARTMENT'
```

### Location Data Loss

**Problem**: Backend doesn't store region, subCity, etc.

**Solution**: Ensure LocationSchema is validated and all fields included in payload

### Type Mismatch on Distance

**Problem**: "distance should be number" error

**Solution**: transformNearbyPlaces() already handles string → number conversion

## References

- Backend DTO: `/src/properties/dto/property.dto.ts`
- Backend Service: `/src/properties/services/properties.service.ts`
- Zod Documentation: https://zod.dev/
- React Hook Form: https://react-hook-form.com/
