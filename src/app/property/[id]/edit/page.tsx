import { AddListingForm, type ListingFormValues } from '@/components/properties/AddListingForm';
import { fetchPropertyById, mapApiProperty } from '@/services/property-service';
import { notFound } from 'next/navigation';

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

function toFormValues(property: any): Partial<ListingFormValues> {
  return {
    id: property.id,
    title: property.title,
    titleAm: property.titleAm || '',
    category: property.category || 'APARTMENT',
    listingType: property.type === 'rent' ? 'RENT' : property.listingType || 'SALE',
    status: property.status || 'ACTIVE',
    location: {
      region: property.location?.region || property.region || 'Addis Ababa',
      city: property.location?.city || property.city || 'Addis Ababa',
      subCity: property.location?.subCity || property.subCity || '',
      address: property.location?.address || property.address || '',
      addressAm: property.location?.addressAm || '',
      latitude: property.coordinates?.lat || property.location?.latitude || 9.021808,
      longitude: property.coordinates?.lng || property.location?.longitude || 38.800203,
      areaName: property.location?.areaName || '',
      woreda: property.location?.woreda || '',
      kebele: property.location?.kebele || '',
    },
    pricing: {
      price: property.price || 0,
      currency: 'ETB',
      priceNegotiable: property.priceNegotiable !== false,
      depositAmount: property.depositAmount || 0,
    },
    details: {
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      totalArea: property.area || 0,
      description: property.description || '',
      descriptionAm: property.descriptionAm || '',
      totalFloors: property.totalFloors || 0,
      floorNumber: property.floorNumber || 0,
      yearBuilt: property.yearBuilt || new Date().getFullYear(),
    },
    amenities: property.amenities || [],
    environmentalInfo: property.environmentalInfo || {
      walkScore: 50,
      bikeScore: 50,
      transitScore: 50,
      roadSafety: 50,
      floodRisk: 50,
      noiseLevel: 50,
      airQuality: 50,
    },
    nearbyPlaces: property.nearbyPlaces || [],
    agentId: property.brokerId || property.broker?.id || '',
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
