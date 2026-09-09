import { apiClient } from '@/lib/api-client';

// Types and Mappings
export interface PropertyFilter {
  query?: string;
  type?: 'sale' | 'rent' | 'all';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string;
  bathrooms?: string;
  page?: number;
  limit?: number;
}

type PropertyMediaValues = {
    images?: Array<{ file?: File; category?: string }>;
    floorPlan?: File;
    videoType?: 'url' | 'upload';
    videoFile?: File;
};

// Use shared transformation utilities instead
import { transformFormToBackendPayload, transformBackendToFormValues, ensureUppercase } from '@/lib/form-transform';
import { PropertyFormSchema } from '@/lib/form-schemas';
import type { PropertyFormValuesDto } from '@/lib/form-types';

function buildPropertyPayload(data: any): any {
    // Validate using shared schema
    const validation = PropertyFormSchema.safeParse(data);
    if (!validation.success) {
        console.warn('[Property Service] Form validation failed:', validation.error.flatten());
    }

    // Use shared transformation utility
    return transformFormToBackendPayload(data);
}

export function mapApiProperty(item: any): any {
    // Use shared transformation
    const formValues = transformBackendToFormValues(item);
    
    // Map to property display interface
    return {
        id: item.id,
        title: formValues.title,
        type: (formValues.listingType || 'SALE').toLowerCase(),
        category: formValues.category?.toLowerCase() || 'apartment',
        price: formValues.pricing?.price || 0,
        location: formValues.location?.city || 'Addis Ababa',
        address: formValues.location?.address || '',
        bedrooms: formValues.details?.bedrooms || 0,
        bathrooms: formValues.details?.bathrooms || 0,
        area: formValues.details?.totalArea || 0,
        description: formValues.details?.description || '',
        images: item.media
            ?.filter((m: any) => !m.type || m.type === 'IMAGE')
            .map((m: any) => ({
              url: m.url || m.publicUrl,
              category: m.category || 'exterior',
            }))
            .filter((m: any) => m.url) || [],
        imageIds: [],
        amenities: item.amenities?.map((e: any) => e.amenity?.name || e.name).filter(Boolean) || formValues.amenities || [],
        floorPlanId: '',
        floorPlanUrl: item.media?.find((m: any) => m.type === 'FLOOR_PLAN')?.publicUrl,
        videoUrl: item.videoUrl || item.media?.find((m: any) => m.type === 'VIDEO')?.publicUrl,
        vrTourUrl: formValues.metaTitle, // Note: VR tour URL mapping
        brokerId: item.agent?.id || formValues.agentId || '',
        status: (formValues.status || 'ACTIVE').toLowerCase(),
        rawStatus: formValues.status,
        postedOn: item.publishedAt || item.createdAt || new Date().toISOString(),
        views: item.viewCount || 0,
        saves: item.saveCount || 0,
        priceHistory: item.priceHistory?.map((e: any) => ({
            date: e.changedAt || e.date,
            price: Number(e.price),
        })) || [],
        environmentalInfo: formValues.environmentalInfo || {
            walkScore: 0,
            bikeScore: 0,
            roadSafety: 0,
            floodRisk: 0,
            noiseLevel: 0,
        },
        nearbyPlaces: formValues.nearbyPlaces || [],
        coordinates: formValues.location?.latitude && formValues.location?.longitude ? {
            lat: Number(formValues.location.latitude),
            lng: Number(formValues.location.longitude),
        } : { lat: 9.021808, lng: 38.800203 },
        broker: item.agent ? {
            id: item.agent.id,
            name: `${item.agent.firstName || ''} ${item.agent.lastName || ''}`.trim() || item.agent.email || 'Agent',
            avatar: item.agent.avatarUrl || '/images/avatar-placeholder.png',
            phone: item.agent.phone || '',
            email: item.agent.email || '',
        } : undefined,
    };
}

async function createMediaRecord(input: {
    propertyId: string;
    file: File;
    type: 'IMAGE' | 'FLOOR_PLAN' | 'VIDEO';
    category: string;
    order?: number;
}) {
    console.log('[Property Service] Creating media record:', {
        propertyId: input.propertyId,
        fileName: input.file.name,
        fileSize: input.file.size,
        fileMimeType: input.file.type,
        type: input.type,
        category: input.category,
        order: input.order,
    });

    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('propertyId', input.propertyId);
    formData.append('type', input.type);
    formData.append('category', input.category);
    formData.append('fileName', input.file.name);
    formData.append('originalName', input.file.name);
    formData.append('mimeType', input.file.type || 'application/octet-stream');
    formData.append('size', String(input.file.size));
    formData.append('status', 'READY');
    formData.append('order', String(input.order || 0));
    formData.append('isFeatured', String(input.order === 0 && input.type === 'IMAGE'));

    console.log('[Property Service] FormData prepared, calling API...');
    
    try {
        const result = await apiClient.postForm('/media', formData);
        console.log('[Property Service] Media record created successfully:', result);
        return result;
    } catch (error: any) {
        console.error('[Property Service] Failed to create media record:', error);
        throw error;
    }
}

export async function uploadPropertyMedia(propertyId: string, values: PropertyMediaValues): Promise<void> {
    console.log('[Property Service] uploadPropertyMedia() called with propertyId:', propertyId);
    console.log('[Property Service] Media values:', {
        imagesCount: values.images?.length || 0,
        hasFloorPlan: !!values.floorPlan,
        videoType: values.videoType,
        hasVideoFile: !!values.videoFile,
    });

    const uploads: Promise<unknown>[] = [];

    values.images?.forEach((image, index) => {
        if (image.file instanceof File) {
            console.log(`[Property Service] Uploading image ${index + 1}/${values.images?.length || 0}`);
            uploads.push(createMediaRecord({
                propertyId,
                file: image.file,
                type: 'IMAGE',
                category: image.category || 'exterior',
                order: index,
            }));
        }
    });

    if (values.floorPlan instanceof File) {
        console.log('[Property Service] Uploading floor plan');
        uploads.push(createMediaRecord({
            propertyId,
            file: values.floorPlan,
            type: 'FLOOR_PLAN',
            category: 'plan',
        }));
    }

    if (values.videoType === 'upload' && values.videoFile instanceof File) {
        console.log('[Property Service] Uploading video');
        uploads.push(createMediaRecord({
            propertyId,
            file: values.videoFile,
            type: 'VIDEO',
            category: 'tour',
        }));
    }

    console.log(`[Property Service] Total media uploads to process: ${uploads.length}`);
    
    try {
        await Promise.all(uploads);
        console.log('[Property Service] All media uploads completed successfully');
    } catch (error: any) {
        console.error('[Property Service] Media upload failed:', error);
        throw error;
    }
}

export async function createProperty(data: any): Promise<any> {
    console.log("Preparing to submit property data:", data);

    // Validate using shared schema
    const validation = PropertyFormSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten();
        console.error('[Property Service] Validation failed:', errors);
        throw new Error(`Form validation failed: ${JSON.stringify(errors.fieldErrors)}`);
    }

    const payload = buildPropertyPayload(data);

    try {
        const response: any = await apiClient.post('/properties', payload);
        if (response?.id) {
            await uploadPropertyMedia(response.id, data);
        }
        return response;
    } catch (error: any) {
        console.error("API call to /properties failed:", error);
        throw new Error(error.message || 'Failed to submit property listing to the server.');
    }
}

export async function updateProperty(id: string, data: any): Promise<any> {
    // Validate using shared schema
    const validation = PropertyFormSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten();
        console.error('[Property Service] Validation failed:', errors);
        throw new Error(`Form validation failed: ${JSON.stringify(errors.fieldErrors)}`);
    }

    try {
        const response = await apiClient.put(`/properties/${id}`, buildPropertyPayload(data));
        await uploadPropertyMedia(id, data);
        return response;
    } catch (error: any) {
        console.error(`API call to update property ${id} failed:`, error);
        throw new Error(error.message || 'Failed to update property.');
    }
}

export async function updatePropertyStatus(id: string, status: string): Promise<any> {
    try {
        return await apiClient.put(`/properties/${id}`, { status });
    } catch (error: any) {
        console.error(`API call to update property status ${id} failed:`, error);
        throw new Error(error.message || 'Failed to update property status.');
    }
}

export async function promoteProperty(id: string): Promise<any> {
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 30);

    try {
        return await apiClient.put(`/properties/${id}`, {
            status: 'ACTIVE',
            featuredUntil: featuredUntil.toISOString(),
        });
    } catch (error: any) {
        console.error(`API call to promote property ${id} failed:`, error);
        throw new Error(error.message || 'Failed to promote property.');
    }
}

export async function deleteProperty(id: string): Promise<boolean> {
    try {
        return await apiClient.delete<boolean>(`/properties/${id}`);
    } catch (error: any) {
        console.error(`API call to delete property ${id} failed:`, error);
        throw new Error(error.message || 'Failed to delete property.');
    }
}

export async function fetchProperties(filters?: PropertyFilter): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters) {
        if (filters.query) {
            params.append('search', filters.query);
        }
        if (filters.type && filters.type !== 'all') {
            params.append('listingType', filters.type.toUpperCase());
        }
        if (filters.minPrice && filters.minPrice > 0) {
            params.append('minPrice', filters.minPrice.toString());
        }
        if (filters.maxPrice && filters.maxPrice !== Infinity) {
            params.append('maxPrice', filters.maxPrice.toString());
        }
        if (filters.bedrooms && filters.bedrooms !== 'any') {
            params.append('minBedrooms', filters.bedrooms.replace('+', ''));
        }
        if (filters.bathrooms && filters.bathrooms !== 'any') {
            params.append('minBathrooms', filters.bathrooms.replace('+', ''));
        }
        if (filters.page) {
            params.append('page', filters.page.toString());
        }
        if (filters.limit) {
            params.append('limit', filters.limit.toString());
        }
    }
    
    const queryString = params.toString();
    const endpoint = `/properties${queryString ? `?${queryString}` : ''}`;
    
    try {
        return await apiClient.get<any>(endpoint);
    } catch (error) {
        console.error("Failed to fetch properties:", error);
        return { items: [], pageInfo: { total: 0 } };
    }
}

export async function fetchFeaturedProperties(): Promise<any> {
    try {
        return await apiClient.get<any>('/properties/featured');
    } catch (error) {
        console.error("Failed to fetch featured properties:", error);
        return { items: [] };
    }
}

export async function fetchMyProperties(): Promise<any> {
    try {
        return await apiClient.get<any>('/properties/my');
    } catch (error) {
        console.error("Failed to fetch current user properties:", error);
        return { items: [], pageInfo: { total: 0 } };
    }
}

export async function fetchPropertyById(id: string): Promise<any> {
    try {
        return await apiClient.get<any>(`/properties/${id}`);
    } catch (error) {
        console.error(`Failed to fetch property by id ${id}:`, error);
        throw error;
    }
}

/**
 * Fetch amenities list from backend API
 * Falls back to constants if API fails
 */
export async function fetchAmenities(): Promise<string[]> {
    try {
        console.log('[Property Service] Fetching amenities from API...');
        console.log('[Property Service] API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1');
        const response = await apiClient.get<any>('/resources/amenities?limit=200');
        console.log('[Property Service] Amenities API response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
            const amenities = response.map((item: any) => item.name || item).filter(Boolean);
            console.log('[Property Service] ✓ Amenities loaded from database:', amenities.length, 'items');
            console.log('[Property Service] Sample amenities:', amenities.slice(0, 5));
            return amenities;
        }
        
        if (response?.items && Array.isArray(response.items)) {
            const amenities = response.items.map((item: any) => item.name || item).filter(Boolean);
            console.log('[Property Service] ✓ Amenities loaded from database:', amenities.length, 'items');
            console.log('[Property Service] Sample amenities:', amenities.slice(0, 5));
            return amenities;
        }
        
        console.warn('[Property Service] Unexpected amenities response format:', response);
        console.warn('[Property Service] Returning empty array - form will use fallback');
        return [];
    } catch (error) {
        console.error('[Property Service] Failed to fetch amenities:', error);
        console.error('[Property Service] Returning empty array - form will use fallback');
        // Return empty array - form will use constants as fallback
        return [];
    }
}

/**
 * Fetch property categories from backend API
 * Falls back to constants if API fails
 */
export async function fetchPropertyCategories(): Promise<string[]> {
    try {
        console.log('[Property Service] Fetching property categories from API...');
        const response = await apiClient.get<any>('/categories');
        
        // Handle different response formats
        if (Array.isArray(response)) {
            const categories = response.map((item: any) => item.name || item).filter(Boolean);
            console.log('[Property Service] Categories loaded:', categories.length);
            return categories;
        }
        
        if (response?.items && Array.isArray(response.items)) {
            const categories = response.items.map((item: any) => item.name || item).filter(Boolean);
            console.log('[Property Service] Categories loaded:', categories.length);
            return categories;
        }
        
        console.warn('[Property Service] Unexpected categories response format:', response);
        return [];
    } catch (error) {
        console.error('[Property Service] Failed to fetch categories, using fallback:', error);
        // Return empty array - form will use constants as fallback
        return [];
    }
}
