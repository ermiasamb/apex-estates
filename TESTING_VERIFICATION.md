# Form System Testing & Verification Guide

## Overview

This guide provides comprehensive testing procedures to verify that the property form system is working correctly and aligned with backend validation requirements.

## Test Environment Setup

### Prerequisites
- Admin Dashboard running (http://localhost:5173 or configured port)
- Frontend Web App running (http://localhost:3000 or configured port)
- Backend API running (http://localhost:3003/api/v1)
- Database with sample data

### Test Data Helpers

```typescript
// Sample property data for testing
const testProperty = {
  title: 'Modern Villa with Ocean View',
  titleAm: 'ዘመናዊ ቪላ የውቅያኖስ እይታ ያለበት',
  category: 'VILLA',  // UPPERCASE
  listingType: 'SALE',
  status: 'DRAFT',
  location: {
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    subCity: 'Bole',
    woreda: '03',
    kebele: '12',
    areaName: 'Gerji Sunshine',
    address: '123 Main Street, Near Stadium',
    addressAm: '123 ዋናው ስትሬት፣ ስታዲየም አቅራቢያ',
    latitude: 9.021808,
    longitude: 38.800203,
    showExactLocation: true,
  },
  pricing: {
    price: 5000000,
    currency: 'ETB',
    priceNegotiable: true,
    depositAmount: 500000,
    paymentTerms: 'Monthly in advance',
    taxIncluded: false,
  },
  details: {
    bedrooms: 4,
    bathrooms: 3,
    totalRooms: 10,
    totalArea: 250,
    lotSize: 500,
    floorNumber: 0,
    totalFloors: 2,
    yearBuilt: 2020,
    parkingSpaces: 2,
    waterSource: 'municipal',
    electricityStatus: 'connected',
    description: 'Stunning villa with modern amenities...',
    descriptionAm: 'አስተናጋጆ ቪላ ዘመናዊ ተቋማት ያለበት...',
    hasGuardHouse: true,
    internetReady: true,
  },
  amenities: ['WiFi', 'Parking', 'Pool', 'Gym'],
  nearbyPlaces: [
    { name: 'Black Lion Hospital', type: 'hospital', distance: 2.5 },
    { name: 'St. Mary School', type: 'school', distance: 1.2 },
  ],
  environmentalInfo: {
    walkScore: 75,
    bikeScore: 60,
    transitScore: 80,
    roadSafety: 85,
    floodRisk: 10,
    noiseLevel: 30,
    airQuality: 70,
  },
  metaTitle: 'Luxury Villa - Bole, Addis Ababa',
  metaDescription: 'Beautiful modern villa with excellent amenities',
  keywords: ['villa', 'luxury', 'addis ababa', 'bole'],
  agentId: 'agent-id-here',
};
```

## Test Cases

### 1. Enum Value Conversion Tests

**Test 1.1: Lowercase Category Conversion**
- **Action**: Create property with `category: 'apartment'` (lowercase)
- **Expected**: Backend receives `category: 'APARTMENT'` (UPPERCASE)
- **Verification**: Check API request in browser DevTools Network tab
- **Pass Criteria**: Network payload shows UPPERCASE value

**Test 1.2: Lowercase ListingType Conversion**
- **Action**: Create property with `listingType: 'sale'` (lowercase)
- **Expected**: Backend receives `listingType: 'SALE'` (UPPERCASE)
- **Verification**: DevTools Network tab
- **Pass Criteria**: Network payload shows UPPERCASE value

**Test 1.3: Status Enum Validation**
- **Action**: Try submitting with invalid status value
- **Expected**: Client-side validation error (not sent to backend)
- **Verification**: Error message displayed in form
- **Pass Criteria**: Error prevents submission

**Test 1.4: All Enum Values**
- **Action**: Test each enum value from PROPERTY_CATEGORIES, LISTING_TYPES, PROPERTY_STATUSES
- **Expected**: All values properly converted
- **Verification**: Network tab for each
- **Pass Criteria**: All values uppercase in API request

### 2. Location Data Tests

**Test 2.1: Location Hierarchy Captured**
- **Action**: Fill all location fields (region, city, subCity, woreda, kebele, areaName, address)
- **Expected**: All fields stored in database
- **Verification**: Edit property and verify all fields are populated
- **Pass Criteria**: All location components preserved

**Test 2.2: Amharic Address**
- **Action**: Enter Amharic address in addressAm field
- **Expected**: Stored and retrieved correctly
- **Verification**: Edit and check addressAm value
- **Pass Criteria**: Amharic text preserved

**Test 2.3: GPS Coordinates**
- **Action**: Set latitude 9.021808, longitude 38.800203
- **Expected**: Coordinates stored and retrieved
- **Verification**: Edit form shows same coordinates
- **Pass Criteria**: Exact match

**Test 2.4: Show Exact Location Flag**
- **Action**: Toggle showExactLocation checkbox
- **Expected**: Boolean value stored
- **Verification**: Edit and verify checkbox state
- **Pass Criteria**: Matches original state

### 3. Pricing Data Tests

**Test 3.1: Price with Currency**
- **Action**: Set price 5000000 with currency 'ETB'
- **Expected**: Both stored, currency not hardcoded as USD
- **Verification**: Edit form shows correct currency
- **Pass Criteria**: Currency matches what was sent

**Test 3.2: Deposit and Terms**
- **Action**: Set deposit 500000, terms "Monthly in advance"
- **Expected**: Both stored in database
- **Verification**: Edit property retrieves both
- **Pass Criteria**: Values match exactly

**Test 3.3: Tax Flag**
- **Action**: Toggle "Tax Included" checkbox
- **Expected**: Boolean stored
- **Verification**: Edit shows correct state
- **Pass Criteria**: State matches

### 4. Property Details Tests

**Test 4.1: All Numeric Fields**
- **Action**: Set bedrooms, bathrooms, totalRooms, totalArea, lotSize, floorNumber, totalFloors, yearBuilt, parkingSpaces
- **Expected**: All values stored (even if 0 or omitted)
- **Verification**: Edit property shows all values
- **Pass Criteria**: All fields populated and correct

**Test 4.2: String Details**
- **Action**: Set waterSource, electricityStatus
- **Expected**: Values stored
- **Verification**: Edit shows both values
- **Pass Criteria**: Exact match

**Test 4.3: Boolean Details**
- **Action**: Toggle hasGuardHouse, internetReady
- **Expected**: Boolean values stored
- **Verification**: Edit shows both toggled
- **Pass Criteria**: States match

**Test 4.4: Description in Both Languages**
- **Action**: Set description (English) and descriptionAm (Amharic)
- **Expected**: Both stored
- **Verification**: Edit shows both descriptions
- **Pass Criteria**: Both languages preserved

### 5. Environmental Scores Tests

**Test 5.1: All Seven Scores**
- **Action**: Set all scores: walkScore, bikeScore, transitScore, roadSafety, floodRisk, noiseLevel, airQuality
- **Expected**: All seven scores stored (including transitScore and airQuality)
- **Expected**: Scores NOT hardcoded with defaults
- **Verification**: Edit property shows all seven scores
- **Pass Criteria**: All seven values present and match input

**Test 5.2: Score Range Validation**
- **Action**: Try setting score to -5 or 105
- **Expected**: Client-side validation error
- **Verification**: Error message prevents submission
- **Pass Criteria**: Only 0-100 allowed

**Test 5.3: Score Precision**
- **Action**: Set scores with decimals (50.5, 75.3)
- **Expected**: Stored with precision
- **Verification**: Edit shows same decimal values
- **Pass Criteria**: Decimal precision preserved

### 6. Type Coercion Tests

**Test 6.1: Distance Field as Number**
- **Action**: Add nearby place with distance "2.5" (string in form)
- **Expected**: Backend receives distance as 2.5 (number)
- **Verification**: DevTools Network tab shows number not string
- **Pass Criteria**: Distance is number type in payload

**Test 6.2: Invalid Distance Coercion**
- **Action**: Add nearby place with distance "abc" (non-numeric)
- **Expected**: Client validation error
- **Verification**: Error prevents submission or defaults to 0
- **Pass Criteria**: Invalid values rejected

### 7. Validation Tests

**Test 7.1: Required Field Validation**
- **Action**: Try submitting with empty title
- **Expected**: Validation error displayed
- **Verification**: Error message shown
- **Pass Criteria**: Submission blocked

**Test 7.2: Minimum Length Validation**
- **Action**: Set title to "ab" (too short)
- **Expected**: Validation error
- **Verification**: Error prevents submission
- **Pass Criteria**: Min length enforced

**Test 7.3: FEATURED Status Requires Date**
- **Action**: Set status FEATURED without featuredUntil
- **Expected**: Validation error
- **Verification**: Error shown, submission blocked
- **Pass Criteria**: Interdependent validation works

**Test 7.4: Featured Date Must Be Future**
- **Action**: Set featuredUntil to past date
- **Expected**: Validation error
- **Verification**: Error prevents submission
- **Pass Criteria**: Date validation works

### 8. Admin vs Frontend Comparison Tests

**Test 8.1: Field Parity**
- **Action**: Create property in admin, note all field values
- **Action**: Create same property in frontend
- **Expected**: Identical fields submitted
- **Verification**: Compare DevTools Network requests
- **Pass Criteria**: Same payloads

**Test 8.2: Enum Handling Parity**
- **Action**: Set category 'apartment' in frontend
- **Action**: Set category 'APARTMENT' in admin
- **Expected**: Both result in same backend value
- **Verification**: DevTools shows same UPPERCASE value
- **Pass Criteria**: Both produce identical requests

**Test 8.3: Location Data Parity**
- **Action**: Fill location in both dashboards
- **Expected**: Same data structures
- **Verification**: Compare network payloads
- **Pass Criteria**: Identical structure and values

### 9. Edit Mode Tests

**Test 9.1: Edit Preserves All Fields**
- **Action**: Create property, then edit
- **Expected**: All fields pre-populated
- **Verification**: All form fields show original values
- **Pass Criteria**: No data loss on edit

**Test 9.2: Edit Updates All Fields**
- **Action**: Modify multiple fields and save
- **Expected**: All changes persisted
- **Verification**: Edit again to verify changes
- **Pass Criteria**: All modifications saved

**Test 9.3: Edit Handles FEATURED Status**
- **Action**: Edit property to FEATURED with future date
- **Expected**: Status change persists
- **Verification**: View property and confirm FEATURED
- **Pass Criteria**: Status and date both stored

### 10. Error Handling Tests

**Test 10.1: Backend Validation Error Display**
- **Action**: Manually send invalid enum to API (via curl)
- **Expected**: Frontend receives error and displays it
- **Verification**: Error message visible to user
- **Pass Criteria**: Error properly communicated

**Test 10.2: Network Error Handling**
- **Action**: Disconnect network and try submit
- **Expected**: Network error caught and displayed
- **Verification**: User sees network error message
- **Pass Criteria**: Graceful error handling

**Test 10.3: Validation Error Summary**
- **Action**: Submit form with multiple validation errors
- **Expected**: All errors displayed
- **Verification**: Error banner shows error count
- **Pass Criteria**: All errors visible

## Automated Test Script

```typescript
// Pseudo-code for automated testing
async function runFullTestSuite() {
  const results = [];

  // Test 1: Enum conversions
  results.push(await testEnumConversion('apartment', 'APARTMENT'));
  results.push(await testEnumConversion('sale', 'SALE'));
  results.push(await testEnumConversion('draft', 'DRAFT'));

  // Test 2: Location data
  results.push(await testLocationDataPersistence());

  // Test 3: Environmental scores
  results.push(await testAllSevenScores());

  // Test 4: Type coercion
  results.push(await testDistanceCoercion());

  // Test 5: Validation
  results.push(await testRequiredFieldValidation());
  results.push(await testFeaturedStatusValidation());

  // Test 6: Parity
  results.push(await testAdminFrontendParity());

  return {
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
  };
}
```

## Manual Testing Checklist

### Admin Dashboard Testing
- [ ] Create property with all fields
- [ ] Verify all fields shown in form
- [ ] Edit property and verify all fields pre-populated
- [ ] Verify enum values are UPPERCASE in network request
- [ ] Verify location hierarchy captured
- [ ] Verify environmental scores include transitScore and airQuality
- [ ] Verify FEATURED status handling
- [ ] Test validation errors display correctly

### Frontend Web App Testing
- [ ] Create property with all available fields
- [ ] Verify enum values converted to UPPERCASE
- [ ] Verify location data captured
- [ ] Verify pricing details stored
- [ ] Verify all environmental scores submitted
- [ ] Edit property and verify fields pre-populated
- [ ] Test validation prevents invalid submissions
- [ ] Compare with admin form data structures

### Cross-Dashboard Comparison
- [ ] Same property created in both dashboards
- [ ] Compare network payloads in DevTools
- [ ] Verify identical data sent to backend
- [ ] Verify both dashboards handle enums the same way
- [ ] Verify location data structure matches
- [ ] Verify environmental scores match

## Expected Results

### Successful Implementation Indicators

✅ **Enum Conversion**
- All lowercase enum values converted to UPPERCASE
- No validation errors from backend for enum values
- DevTools shows UPPERCASE values in API requests

✅ **Location Data**
- All 11 location fields stored in database
- Edit mode shows all location components
- Amharic address preserved

✅ **Environmental Scores**
- All 7 scores stored (including transitScore and airQuality)
- Scores NOT defaulted to 0
- Custom values preserved through create/edit cycles

✅ **Validation**
- Client-side validation prevents invalid submissions
- Validation errors clearly displayed
- Backend and frontend validation aligned

✅ **Field Coverage**
- All 40+ database fields captured
- No data loss in transformation
- Type coercion working correctly

✅ **Admin/Frontend Parity**
- Both dashboards submit identical payloads
- Same enum handling
- Same field coverage
- Same validation rules

## Troubleshooting

### Issue: Enums still lowercase in API request

**Diagnosis**: Check that `ensureUppercase()` is being called
**Solution**: Verify `transformFormToBackendPayload()` is used in API submission
**Verification**: Add console.log before API call

### Issue: Environmental scores defaulted to 0

**Diagnosis**: Backend applying defaults instead of preserving submitted values
**Solution**: Verify form is submitting all 7 scores
**Verification**: Check DevTools Network tab for all scores

### Issue: Location data not persisting

**Diagnosis**: Location schema not including all fields
**Solution**: Verify LocationSchema includes all 11 fields
**Verification**: Check form-schemas.ts LocationSchema

### Issue: Type error on distance field

**Diagnosis**: Distance not being coerced to number
**Solution**: Verify transformNearbyPlaces() includes parseFloat
**Verification**: Check network payload shows distance as number

### Issue: Validation not working

**Diagnosis**: Schema not being used
**Solution**: Verify createProperty/updateProperty call validateForm
**Verification**: Check property-service.ts validation code

## Performance Considerations

- Form initialization with 40+ fields: < 200ms
- Validation on submit: < 100ms
- Transformation to backend: < 50ms
- API round-trip: variable (network dependent)

## Browser Compatibility

- Chrome 90+: Full support
- Firefox 88+: Full support
- Safari 14+: Full support
- Edge 90+: Full support

## Success Criteria

Form system is successfully implemented when:

1. ✅ All 40+ database fields are captured in both dashboards
2. ✅ Enum values properly converted (lowercase → UPPERCASE)
3. ✅ No data loss in frontend ↔ backend transformation
4. ✅ All validation rules enforced on client-side
5. ✅ Backend receives properly formatted data
6. ✅ Admin and frontend forms feature-parity
7. ✅ Edit mode preserves all data
8. ✅ Environmental scores include all 7 fields
9. ✅ Location hierarchy fully captured
10. ✅ Pricing details complete and stored

## Next Steps

After successful testing:
1. Deploy updated code to staging
2. Run full integration tests with backend
3. Performance testing with production data volume
4. User acceptance testing (UAT)
5. Production deployment
