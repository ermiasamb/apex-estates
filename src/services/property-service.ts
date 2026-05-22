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

const categoryToBackend: Record<string, string> = {
    apartment: 'APARTMENT',
    condominium: 'CONDO',
    villa: 'VILLA',
    house: 'VILLA',
    townhouse: 'TOWNHOUSE',
    land: 'LAND_PLOT',
};

const categoryToFrontend: Record<string, string> = {
    APARTMENT: 'apartment',
    CONDO: 'condominium',
    VILLA: 'villa',
    TOWNHOUSE: 'townhouse',
    LAND_PLOT: 'land',
};

const statusToBackend: Record<string, string> = {
    available: 'ACTIVE',
    sold: 'SOLD',
    rented: 'RENTED',
    draft: 'DRAFT',
    active: 'ACTIVE',
    featured: 'FEATURED',
};

const statusToFrontend: Record<string, string> = {
    ACTIVE: 'available',
    FEATURED: 'available',
    PENDING_APPROVAL: 'available',
    SOLD: 'sold',
    RENTED: 'rented',
    DRAFT: 'draft',
    ARCHIVED: 'archived',
};

function buildPropertyPayload(data: any): any {
    const cityState = data.location || 'Addis Ababa, Ethiopia';
    const city = cityState.split(',')[0]?.trim() || 'Addis Ababa';
    const country = cityState.split(',')[1]?.trim() || 'Ethiopia';

    return {
        title: data.title,
        titleAm: data.title,
        category: categoryToBackend[(data.category || '').toLowerCase()] || 'APARTMENT',
        propertyType: 'RESIDENTIAL',
        listingType: (data.type || 'sale').toUpperCase(),
        status: statusToBackend[(data.status || '').toLowerCase()] || undefined,
        location: {
            address: data.address || data.location || 'Addis Ababa',
            city,
            country,
            state: city,
            latitude: Number(data.coordinates?.lat) || 9.021808,
            longitude: Number(data.coordinates?.lng) || 38.800203,
        },
        pricing: {
            price: Number(data.price),
            currency: 'USD',
            priceNegotiable: true,
        },
        details: {
            bedrooms: Number(data.bedrooms) || 0,
            bathrooms: Number(data.bathrooms) || 0,
            totalArea: Number(data.area) || 0,
            description: data.description || '',
            amenities: data.amenities || [],
            parkingSpaces: 1,
            yearBuilt: 2024,
        },
        amenities: data.amenities || [],
        nearbyPlaces: data.nearbyPlaces || [],
        environmentalInfo: data.environmentalInfo,
        videoUrl: data.videoUrl || undefined,
        virtualTourUrl: data.vrTourUrl || undefined,
        floorPlanUrl: data.floorPlanUrl || undefined,
        agentId: data.brokerId || undefined,
    };
}

export function mapApiProperty(item: any): any {
    const city = item.location?.city || item.city || 'Addis Ababa';
    const address = item.location?.address || item.address || city;
    const latitude = item.location?.latitude ?? item.latitude;
    const longitude = item.location?.longitude ?? item.longitude;
    const mediaItems = item.media || [];
    const mediaUrls = mediaItems.length > 0
        ? mediaItems
            .filter((media: any) => !media.type || media.type === 'IMAGE')
            .map((media: any) => media.url || media.publicUrl)
            .filter(Boolean)
        : [];
    const floorPlanUrl = mediaItems.find((media: any) => media.type === 'FLOOR_PLAN')?.publicUrl;
    const uploadedVideoUrl = mediaItems.find((media: any) => media.type === 'VIDEO')?.publicUrl;

    return {
        id: item.id,
        title: item.title,
        type: item.listingType?.toLowerCase() || 'sale',
        category: categoryToFrontend[item.category] || categoryToFrontend[item.type] || item.category?.toLowerCase() || item.type?.toLowerCase() || 'apartment',
        price: Number(item.pricing?.price ?? item.price ?? 0),
        location: city,
        address,
        bedrooms: item.details?.bedrooms ?? item.bedrooms ?? 0,
        bathrooms: item.details?.bathrooms ?? item.bathrooms ?? 0,
        area: item.details?.totalArea ?? item.area ?? 0,
        description: item.details?.description ?? item.description ?? '',
        images: mediaUrls,
        imageIds: [],
        amenities: item.details?.amenities ?? item.amenities?.map((entry: any) => entry.amenity?.name || entry.name).filter(Boolean) ?? [],
        floorPlanId: '',
        floorPlanUrl,
        videoUrl: item.videoUrl || uploadedVideoUrl,
        vrTourUrl: item.virtualTourUrl,
        brokerId: item.agent?.id || item.agentId || '',
        status: statusToFrontend[item.status] || item.status?.toLowerCase() || 'available',
        rawStatus: item.status,
        postedOn: item.publishedAt || item.createdAt || new Date().toISOString(),
        views: item.viewCount ?? item.views ?? 0,
        saves: item.saveCount ?? item.saves ?? 0,
        priceHistory: item.priceHistory?.map((entry: any) => ({
            date: entry.changedAt || entry.date,
            price: Number(entry.price),
        })) ?? [],
        environmentalInfo: item.environmentalInfo ?? {
            walkScore: 0,
            bikeScore: 0,
            roadSafety: 0,
            floodRisk: 0,
            noiseLevel: 0,
        },
        nearbyPlaces: item.nearbyPlaces?.map((place: any) => ({
            name: place.name || place.type || 'Nearby place',
            type: (place.type || 'transport').toLowerCase(),
            distance: place.distance ? String(place.distance) : '',
        })) ?? [],
        coordinates: latitude && longitude ? {
            lat: Number(latitude),
            lng: Number(longitude),
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
