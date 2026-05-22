import { AddListingForm, type ListingFormValues } from '@/components/properties/AddListingForm';
import { fetchPropertyById, mapApiProperty } from '@/services/property-service';
import { notFound } from 'next/navigation';

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

function toFormValues(property: any): Partial<ListingFormValues> {
  return {
    title: property.title,
    description: property.description || '',
    type: property.type === 'rent' ? 'rent' : 'sale',
    category: property.category || 'apartment',
    status: ['available', 'sold', 'rented', 'draft'].includes(property.status) ? property.status : 'available',
    price: property.price || 0,
    location: property.location || 'Addis Ababa, Ethiopia',
    address: property.address || '',
    coordinates: property.coordinates || { lat: 9.021808, lng: 38.800203 },
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 1,
    amenities: property.amenities || [],
    brokerId: property.brokerId || property.broker?.id || '',
    environmentalInfo: property.environmentalInfo || {
      walkScore: 50,
      bikeScore: 50,
      roadSafety: 50,
      floodRisk: 50,
      noiseLevel: 50,
    },
    nearbyPlaces: property.nearbyPlaces || [],
    images: [],
    floorPlanUrl: property.floorPlanUrl || '',
    videoType: property.videoUrl ? 'url' : 'upload',
    videoUrl: property.videoUrl || '',
    vrTourUrl: property.vrTourUrl || '',
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;

  try {
    const apiProperty = await fetchPropertyById(id);
    const property = mapApiProperty(apiProperty);

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-headline font-bold">Edit Property</h1>
            <p className="text-muted-foreground mt-2">
              Update listing details, pricing, location, media links, and availability.
            </p>
          </div>
          <AddListingForm
            mode="edit"
            propertyId={id}
            initialValues={toFormValues(property)}
            existingImageUrls={property.images || []}
            existingFloorPlanUrl={property.floorPlanUrl}
            existingVideoUrl={property.videoUrl}
            currentAgent={property.broker}
          />
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
