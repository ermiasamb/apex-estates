'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, UploadCloud, Image as ImageIcon, MapPin, Film, FileText, Activity } from 'lucide-react';
import type { NearbyPlaceType, PropertyCategory } from '@/lib/types';
import { LocationPicker } from './LocationPicker';
import { ImageDropzone } from './ImageDropzone';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageCategory } from '@/lib/placeholder-images';
import { createProperty, updateProperty, fetchAmenities, fetchPropertyCategories } from '@/services/property-service';
import { fetchAgents } from '@/services/user-service';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

// Import shared form utilities
import { SimplifiedPropertyFormSchema } from '@/lib/form-schemas';
import { 
  PROPERTY_CATEGORIES, 
  LISTING_TYPES, 
  PROPERTY_STATUSES, 
  NEARBY_PLACE_TYPES, 
  AMENITIES_LIST,
  CURRENCIES,
  WATER_SOURCES,
  ELECTRICITY_STATUSES,
  IMAGE_CATEGORIES,
} from '@/lib/form-constants';
import type { PropertyFormValuesDto } from '@/lib/form-types';
import { transformFormToBackendPayload } from '@/lib/form-transform';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format number with currency separators
const formatNumberWithCommas = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return num.toLocaleString('en-ET');
};

// Parse number input (remove commas)
const parseNumberInput = (value: string): number => {
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};

// Environmental/Area score labels with color coding
const getScoreLabel = (score: number): string => {
  if (score < 33) return 'Poor';
  if (score < 66) return 'Average';
  return 'Good';
};

// Nearby place types with proper capitalization (Issue #1 fix)
const getCapitalizedPlaceType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'hospital': 'Hospital',
    'school': 'School',
    'restaurant': 'Restaurant',
    'church': 'Church',
    'playground': 'Playground',
    'transport': 'Transport',
    'gym': 'Gym',
    'spa': 'Spa',
    'mall': 'Mall',
    'market': 'Market',
    'bank': 'Bank',
    'park': 'Park',
    'library': 'Library',
    'pharmacy': 'Pharmacy',
  };
  return typeMap[type.toLowerCase()] || type;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AddListingFormProps {
  mode?: 'create' | 'edit';
  propertyId?: string;
  initialValues?: Partial<PropertyFormValuesDto>;
  existingImageUrls?: string[];
  existingFloorPlanUrl?: string;
  existingVideoUrl?: string;
  currentAgent?: { id: string; name: string };
}

type ListingFormValues = Partial<PropertyFormValuesDto> & {
  brokerId?: string;
  ownerName?: string;
  ownerPhone?: string;
};

// Export for use in other files
export type { ListingFormValues };

interface MediaFile {
  localId: string;
  file?: File;
  preview?: string;
  category: string;
  mediaId?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AddListingForm({ mode = 'create', propertyId, initialValues, existingImageUrls = [], existingFloorPlanUrl, existingVideoUrl, currentAgent }: AddListingFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [amenitiesOptions, setAmenitiesOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<MediaFile[]>([]);
  const [floorPlanFiles, setFloorPlanFiles] = useState<MediaFile[]>([]);
  const [videoType, setVideoType] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [virtualTourUrl, setVirtualTourUrl] = useState<string>('');

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to create a property listing.',
      });
      router.push('/login?redirect=/add-listing');
    }
  }, [isAuthenticated, router, toast]);

  // Fetch amenities and categories from backend API (Issue #3 fix)
  useEffect(() => {
    async function loadFormData() {
      try {
        const [agentsResult, amenitiesResult, categoriesResult] = await Promise.all([
          fetchAgents(),
          fetchAmenities(),
          fetchPropertyCategories(),
        ]);
        
        setAgents(agentsResult || []);
        setAmenitiesOptions(
          amenitiesResult && amenitiesResult.length > 0 ? amenitiesResult : AMENITIES_LIST
        );
        // Use PROPERTY_CATEGORIES constants for now since API returns display names
        // Categories need to be uppercase enum values for validation
        setCategoryOptions(Object.values(PROPERTY_CATEGORIES));
      } catch (error) {
        console.error('[AddListingForm] Error loading form data:', error);
        setAmenitiesOptions(AMENITIES_LIST);
        setCategoryOptions(Object.values(PROPERTY_CATEGORIES));
      }
    }
    loadFormData();
  }, []);

  // Form setup with validation
  const form = useForm<Partial<ListingFormValues>>({
    resolver: zodResolver(SimplifiedPropertyFormSchema as any),
    mode: 'onSubmit', // Validate only on submit
    reValidateMode: 'onChange', // Re-validate on change after first submit
    defaultValues: {
      title: '',
      titleAm: '',
      listingType: 'SALE',
      category: 'APARTMENT',
      status: 'DRAFT',
      ownerName: '',
      ownerPhone: '',
      location: {
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: '',
        woreda: '',
        kebele: '',
        areaName: '',
        address: '',
        addressAm: '',
        latitude: 9.021808,
        longitude: 38.800203,
        showExactLocation: true,
      },
      pricing: {
        price: 0,
        currency: 'ETB',
        priceNegotiable: true,
        depositAmount: 0,
        paymentTerms: '',
        taxIncluded: false,
      },
      details: {
        bedrooms: 1,
        bathrooms: 1,
        totalRooms: 1,
        totalArea: 100,
        lotSize: 0,
        floorNumber: 0,
        totalFloors: 1,
        yearBuilt: new Date().getFullYear(),
        parkingSpaces: 0,
        waterSource: undefined,
        electricityStatus: undefined,
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
      agentId: '',
      ...initialValues,
    },
  });

  const { fields: nearbyFields, append: appendNearby, remove: removeNearby } = useFieldArray({
    control: form.control,
    name: "nearbyPlaces"
  });

  // ============================================================================
  // MEDIA HANDLERS
  // ============================================================================

  const handleAddImages = (files: File[]) => {
    const newImages = files.map(file => ({
      localId: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      category: 'exterior',
    }));
    setImageFiles([...imageFiles, ...newImages]);
  };

  const handleRemoveImage = (localId: string) => {
    setImageFiles(imageFiles.filter(img => img.localId !== localId));
  };

  const handleUpdateImageCategory = (localId: string, category: string) => {
    setImageFiles(imageFiles.map(img => 
      img.localId === localId ? { ...img, category } : img
    ));
  };

  const handleAddFloorPlans = (files: File[]) => {
    const newPlans = files.map(file => ({
      localId: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      category: 'floor-plan',
    }));
    setFloorPlanFiles([...floorPlanFiles, ...newPlans]);
  };

  const handleRemoveFloorPlan = (localId: string) => {
    setFloorPlanFiles(floorPlanFiles.filter(plan => plan.localId !== localId));
  };

  const handleAddVideo = (files: File[]) => {
    if (files[0]) {
      setVideoFile(files[0]);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
  };

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  async function onSubmit(values: Partial<ListingFormValues>) {
    console.log('[AddListingForm] onSubmit called with values:', values);
    console.log('[AddListingForm] isAuthenticated:', isAuthenticated);
    console.log('[AddListingForm] Form state:', form.formState);
    console.log('[AddListingForm] Form errors:', form.formState.errors);
    
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to create a property listing.',
      });
      router.push('/login?redirect=/add-listing');
      return;
    }

    setIsLoading(true);
    try {
      const validation = SimplifiedPropertyFormSchema.safeParse(values);
      if (!validation.success) {
        const errors = validation.error.flatten();
        console.error('[AddListingForm] Validation failed:', errors);
        console.error('[AddListingForm] Field errors:', errors.fieldErrors);
        console.error('[AddListingForm] Form errors:', errors.formErrors);
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please check your form for errors',
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        ...transformFormToBackendPayload(values as PropertyFormValuesDto),
        // Add media files for submission
        images: imageFiles.map(img => ({
          file: img.file,
          category: img.category,
        })),
        floorPlan: floorPlanFiles[0]?.file,
        videoType,
        videoUrl: videoType === 'url' ? videoUrl : undefined,
        videoFile: videoType === 'upload' ? videoFile : undefined,
        virtualTourUrl,
      };

      if (mode === 'edit' && propertyId) {
        await updateProperty(propertyId, payload);
      } else {
        await createProperty(payload);
      }

      toast({
        title: mode === 'edit' ? 'Property Updated' : 'Property Submitted!',
        description: mode === 'edit'
          ? `"${values.title}" has been successfully updated.`
          : `"${values.title}" has been successfully submitted for review.`,
      });

      if (mode === 'edit') {
        router.push('/my-properties');
        router.refresh();
      } else {
        form.reset();
        setImageFiles([]);
        setFloorPlanFiles([]);
        setVideoFile(null);
        setVideoUrl('');
        setVirtualTourUrl('');
      }
    } catch (error: any) {
      console.error('[AddListingForm] Submission error:', error);
      toast({
        variant: 'destructive',
        title: mode === 'edit' ? 'Update Failed' : 'Submission Failed',
        description: error.message || 'There was a problem with your submission.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const brokerOptions = useMemo(() => {
    if (!currentAgent?.id || agents.some((broker: any) => broker.id === currentAgent.id)) {
      return agents;
    }
    return [
      { id: currentAgent.id, name: currentAgent.name },
      ...agents,
    ];
  }, [currentAgent, agents]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('[AddListingForm] Form submit event triggered');
          console.log('[AddListingForm] Form is valid:', form.formState.isValid);
          console.log('[AddListingForm] Form errors:', form.formState.errors);
          console.log('[AddListingForm] Form values:', form.getValues());
          
          // Call handleSubmit with both success and error handlers
          form.handleSubmit(
            onSubmit, 
            (errors) => {
              console.error('[AddListingForm] Form validation errors:', errors);
              toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please check the form for missing or invalid fields',
              });
            }
          )(e);
        }} 
        className="space-y-8"
      >
        
        {/* ========================================
            BASIC INFORMATION SECTION
            ======================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Property title, description, category and listing terms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title *</FormLabel>
                  <FormControl><Input placeholder="e.g., Modern Villa with Ocean View" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="titleAm" render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title (Amharic)</FormLabel>
                  <FormControl><Input placeholder="ዘመናዊ ቪላ" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="details.description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl><Textarea placeholder="Describe your property in detail..." rows={4} {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="details.descriptionAm" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Amharic)</FormLabel>
                  <FormControl><Textarea placeholder="ተብራራ በአማርኛ..." rows={4} {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="listingType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'SALE'}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {Object.values(LISTING_TYPES || {}).map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Property Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'APARTMENT'}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {categoryOptions.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
          </CardContent>
        </Card>

        {/* ========================================
            OWNER INFORMATION SECTION (Issue #2)
            ======================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Provide owner details for the property.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Phone Number</FormLabel>
                    <FormControl><Input type="tel" placeholder="e.g., +251 9XX XXX XXXX" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* ========================================
            PRICING SECTION (Issue #4: Currency formatting)
            ======================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Price, currency, and payment terms with automatic formatting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="pricing.price" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="e.g., 5,000,000" 
                        value={field.value ? formatNumberWithCommas(field.value) : ''}
                        onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Enter price with automatic comma formatting</FormDescription>
                    <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="pricing.currency" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'ETB'}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {Object.values(CURRENCIES || {}).map(currency => (
                              <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="pricing.depositAmount" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Deposit Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="e.g., 500,000" 
                        value={field.value ? formatNumberWithCommas(field.value) : ''}
                        onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Automatic comma formatting</FormDescription>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="pricing.priceNegotiable" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 mt-8">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Price is Negotiable</FormLabel>
                    </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="pricing.paymentTerms" render={({ field }) => (
                <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Monthly in advance..." rows={2} {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="pricing.taxIncluded" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Tax Included in Price</FormLabel>
                </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ========================================
            LOCATION SECTION (Issue #5: Auto-fill hierarchy)
            ======================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Click on the map to auto-fill region, sub-city, and city. Duplicates will be removed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="h-96 rounded-lg overflow-hidden border">
                    <LocationPicker
                        initialPosition={{ lat: form.getValues('location')?.latitude || 9.021808, lng: form.getValues('location')?.longitude || 38.800203 }}
                        onLocationChange={({ lat, lng, address, cityState, region, subCity }) => {
                            form.setValue('location.latitude', lat);
                            form.setValue('location.longitude', lng);
                            form.setValue('location.address', address);
                            
                            // Issue #5: Auto-fill location hierarchy and remove duplicates
                            const city = cityState.split(',')[0].trim();
                            const state = cityState.split(',')[1]?.trim() || '';
                            
                            form.setValue('location.city', city);
                            form.setValue('location.region', state || city); // Use state if available
                            if (subCity) {
                              form.setValue('location.subCity', subCity);
                            }
                        }}
                    />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  
                 <FormField control={form.control} name="location.address" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Address (auto-filled)</FormLabel>
                        <FormControl><Input readOnly {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="location.city" render={({ field }) => (
                    <FormItem>
                        <FormLabel>City (auto-filled)</FormLabel>
                        <FormControl><Input readOnly {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="location.region" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Region/State</FormLabel>
                        <FormControl><Input placeholder="e.g., Addis Ababa" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="location.subCity" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sub-City / District (auto-filled)</FormLabel>
                        <FormControl><Input placeholder="e.g., Bole" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="location.areaName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area / Neighborhood Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Gerji Sunshine" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="location.addressAm" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address (Amharic)</FormLabel>
                        <FormControl><Input placeholder="አድራሻ በአማርኛ" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                </div>
            </CardContent>
        </Card>

        {/* ========================================
            PROPERTY DETAILS SECTION
            ======================================== */}
        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle><CardDescription>Specify the size, layout, and features.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="details.bedrooms" render={({ field }) => ( <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="details.bathrooms" render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            
              <FormField control={form.control} name="details.totalArea" render={({ field }) => ( <FormItem><FormLabel>Total Area (sqm) *</FormLabel><FormControl><Input type="number" placeholder="e.g., 250" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="details.lotSize" render={({ field }) => ( <FormItem><FormLabel>Lot Size (sqm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            
              <FormField control={form.control} name="details.totalRooms" render={({ field }) => ( <FormItem><FormLabel>Total Rooms</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="details.parkingSpaces" render={({ field }) => ( <FormItem><FormLabel>Parking Spaces</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            
              <FormField control={form.control} name="details.floorNumber" render={({ field }) => ( <FormItem><FormLabel>Floor Number</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="details.totalFloors" render={({ field }) => ( <FormItem><FormLabel>Total Floors</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />

              <FormField control={form.control} name="details.yearBuilt" render={({ field }) => ( <FormItem><FormLabel>Year Built</FormLabel><FormControl><Input type="number" placeholder="e.g., 2020" {...field} value={field.value || new Date().getFullYear()} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="details.waterSource" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Water Source</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {Object.values(WATER_SOURCES || {}).map(source => (
                              <SelectItem key={source} value={source}>{source.charAt(0).toUpperCase() + source.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
              )} />
            <FormField control={form.control} name="details.electricityStatus" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Electricity Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                          {Object.values(ELECTRICITY_STATUSES || {}).map(status => (
                            <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                          ))}
                      </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
            )} />
              <FormField control={form.control} name="details.hasGuardHouse" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Has Guard House</FormLabel>
                    </FormItem>
              )} />
              <FormField control={form.control} name="details.internetReady" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Internet Ready</FormLabel>
                    </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* ========================================
            ENVIRONMENTAL & AREA INFORMATION (Issue #6: Range sliders)
            ======================================== */}
        <Card>
            <CardHeader><CardTitle>Environmental & Area Information</CardTitle><CardDescription>Use sliders to rate walkability, safety, and environmental conditions (0-100).</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                {/* Walk Score */}
                <FormField control={form.control} name="environmentalInfo.walkScore" render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center mb-2">
                            <FormLabel>Walk Score</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{field.value || 50}</span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{getScoreLabel(field.value || 50)}</span>
                            </div>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={1} 
                            value={[field.value || 50]} 
                            onValueChange={(val) => field.onChange(val[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">How walkable is the neighborhood?</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Bike Score */}
                <FormField control={form.control} name="environmentalInfo.bikeScore" render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center mb-2">
                            <FormLabel>Bike Score</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{field.value || 50}</span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{getScoreLabel(field.value || 50)}</span>
                            </div>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={1} 
                            value={[field.value || 50]} 
                            onValueChange={(val) => field.onChange(val[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">How bike-friendly is the neighborhood?</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Transit Score */}
                <FormField control={form.control} name="environmentalInfo.transitScore" render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center mb-2">
                            <FormLabel>Transit Score</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{field.value || 50}</span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{getScoreLabel(field.value || 50)}</span>
                            </div>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={1} 
                            value={[field.value || 50]} 
                            onValueChange={(val) => field.onChange(val[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Quality of public transportation access</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Road Safety */}
                <FormField control={form.control} name="environmentalInfo.roadSafety" render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center mb-2">
                            <FormLabel>Road Safety</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{field.value || 50}</span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{getScoreLabel(field.value || 50)}</span>
                            </div>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={1} 
                            value={[field.value || 50]} 
                            onValueChange={(val) => field.onChange(val[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Safety level on nearby roads</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Flood Risk */}
                <FormField control={form.control} name="environmentalInfo.floodRisk" render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center mb-2">
                            <FormLabel>Flood Risk</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{field.value || 50}</span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{getScoreLabel(field.value || 50)}</span>
                            </div>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={1} 
                            value={[field.value || 50]} 
                            onValueChange={(val) => field.onChange(val[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Lower score = lower risk of flooding</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Noise Level */}
                <FormField control={form.control} name="environmentalInfo.noiseLevel" render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center mb-2">
                            <FormLabel>Noise Level</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{field.value || 50}</span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{getScoreLabel(field.value || 50)}</span>
                            </div>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={1} 
                            value={[field.value || 50]} 
                            onValueChange={(val) => field.onChange(val[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Lower score = quieter environment</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Air Quality */}
                <FormField control={form.control} name="environmentalInfo.airQuality" render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center mb-2">
                            <FormLabel>Air Quality</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{field.value || 50}</span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{getScoreLabel(field.value || 50)}</span>
                            </div>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={1} 
                            value={[field.value || 50]} 
                            onValueChange={(val) => field.onChange(val[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Higher score = better air quality</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        {/* ========================================
            AMENITIES SECTION
            ======================================== */}
        <Card>
          <CardHeader><CardTitle>Amenities</CardTitle><CardDescription>Select all amenities that apply to the property.</CardDescription></CardHeader>
          <CardContent>
            <FormField control={form.control} name="amenities" render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {amenitiesOptions.map((amenity) => (
                      <FormField key={amenity} control={form.control} name="amenities" render={({ field }) => (
                            <FormItem key={amenity} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl><Checkbox checked={field.value?.includes(amenity) || false} onCheckedChange={(checked) => {
                                    return checked ? field.onChange([...(field.value || []), amenity]) : field.onChange(field.value?.filter((value) => value !== amenity))
                                  }} /></FormControl>
                              <FormLabel className="font-normal">{amenity}</FormLabel>
                            </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
          </CardContent>
        </Card>

        {/* ========================================
            NEARBY PLACES SECTION (Issue #1: Capitalized types, meters)
            ======================================== */}
        <Card>
            <CardHeader><CardTitle>Nearby Places</CardTitle><CardDescription>Add places of interest near the property. Distance in meters.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {nearbyFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-4 border rounded-md relative">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                             <FormField control={form.control} name={`nearbyPlaces.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Place Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name={`nearbyPlaces.${index}.type`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                          {Object.entries(NEARBY_PLACE_TYPES || {}).map(([key, type]) => (
                                            <SelectItem key={type} value={type}>{getCapitalizedPlaceType(type)}</SelectItem>
                                          ))}
                                        </SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name={`nearbyPlaces.${index}.distance`} render={({ field }) => (<FormItem><FormLabel>Distance (meters)</FormLabel><FormControl><Input placeholder="e.g., 500" type="number" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')} /></FormControl><FormMessage /></FormItem>)} />
                         </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeNearby(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendNearby({ name: "", type: "hospital", distance: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Nearby Place</Button>
            </CardContent>
        </Card>

        {/* ========================================
            MEDIA UPLOAD SECTION (Issue #7: Complete media management)
            ======================================== */}
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Gallery Photos</CardTitle>
              <CardDescription>Upload high-quality exterior and interior images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageDropzone onDrop={handleAddImages} />
              {imageFiles.length === 0 ? (
                <div className="py-8 px-4 text-center border-2 border-dashed rounded-lg bg-slate-50">
                  <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageFiles.map((image) => (
                    <div key={image.localId} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                      {image.preview && (
                        <div className="relative h-16 w-16 shrink-0 rounded overflow-hidden">
                          <img src={image.preview} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{image.file?.name}</p>
                        <select 
                          value={image.category} 
                          onChange={(e) => handleUpdateImageCategory(image.localId, e.target.value)}
                          className="mt-1 w-full text-xs border rounded px-2 py-1"
                        >
                          <option value="exterior">Exterior</option>
                          <option value="interior">Interior</option>
                          <option value="living-room">Living Room</option>
                          <option value="kitchen">Kitchen</option>
                          <option value="bedroom">Bedroom</option>
                          <option value="bathroom">Bathroom</option>
                        </select>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="shrink-0"
                        onClick={() => handleRemoveImage(image.localId)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
        </Card>

        {/* Floor Plans */}
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Floor Plans</CardTitle>
              <CardDescription>Upload architectural layouts and spatial blueprints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageDropzone onDrop={handleAddFloorPlans} />
              {floorPlanFiles.length === 0 ? (
                <div className="py-8 px-4 text-center border-2 border-dashed rounded-lg bg-slate-50">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No floor plans uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {floorPlanFiles.map((plan) => (
                    <div key={plan.localId} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                      {plan.preview && (
                        <div className="relative h-16 w-16 shrink-0 rounded overflow-hidden">
                          <img src={plan.preview} alt="" className="h-full w-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{plan.file?.name}</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="shrink-0"
                        onClick={() => handleRemoveFloorPlan(plan.localId)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
        </Card>

        {/* Video Tours */}
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Film className="h-5 w-5" />Immersive Experience</CardTitle>
              <CardDescription>Cinematic video tours and 360° virtual walkthroughs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Type Selection */}
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={videoType === 'url' ? 'default' : 'outline'}
                  onClick={() => setVideoType('url')}
                  className="flex-1"
                >
                  Video URL
                </Button>
                <Button 
                  type="button" 
                  variant={videoType === 'upload' ? 'default' : 'outline'}
                  onClick={() => setVideoType('upload')}
                  className="flex-1"
                >
                  Upload Video
                </Button>
              </div>

              {/* Video URL Input */}
              {videoType === 'url' && (
                <FormItem>
                  <FormLabel>Video Tour URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="e.g., https://www.youtube.com/embed/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">Paste YouTube or Vimeo embed URL</FormDescription>
                </FormItem>
              )}

              {/* Video Upload */}
              {videoType === 'upload' && (
                <div>
                  <ImageDropzone onDrop={handleAddVideo} />
                  {videoFile && (
                    <div className="mt-4 p-3 border rounded-lg bg-white flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{videoFile.name}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={handleRemoveVideo}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* 360° Virtual Tour */}
              <FormItem>
                <FormLabel>360° Virtual Walkthrough URL</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="e.g., Matterport URL or similar..."
                    value={virtualTourUrl}
                    onChange={(e) => setVirtualTourUrl(e.target.value)}
                  />
                </FormControl>
                <FormDescription className="text-xs">Link to your 360° tour or Matterport</FormDescription>
              </FormItem>
            </CardContent>
        </Card>

        {/* ========================================
            AGENT SECTION
            ======================================== */}
        <Card>
            <CardHeader><CardTitle>Listing Agent</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="agentId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Agent (if applicable)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an agent" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {brokerOptions.map((broker: any) => (
                                <SelectItem key={broker.id} value={broker.id}>{broker.name}</SelectItem>
                              ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        {/* ========================================
            SUBMIT BUTTON
            ======================================== */}
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1"
            onClick={(e) => {
              console.log('[AddListingForm] Submit button clicked');
              console.log('[AddListingForm] Button disabled:', isLoading);
              console.log('[AddListingForm] Event:', e);
            }}
          >
            {isLoading ? (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Submitting...
              </>
            ) : mode === 'edit' ? (
              'Update Property'
            ) : (
              'Submit Property'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
