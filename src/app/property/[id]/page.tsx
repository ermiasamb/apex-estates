'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PropertyDetail } from "@/components/properties/PropertyDetail";
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPropertyById, mapApiProperty } from "@/services/property-service";

export default function PropertyDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      try {
        const apiProperty = await fetchPropertyById(params.id as string);
        if (apiProperty) {
          setProperty(mapApiProperty(apiProperty));
        }
      } catch (error) {
        console.error("Failed to load property:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-96 mb-4" />
        <Skeleton className="h-6 w-64 mb-8" />
        <Skeleton className="h-32 w-full mb-4" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <p className="text-muted-foreground mt-2">The requested property could not be found.</p>
      </div>
    );
  }
  
  return <PropertyDetail property={property} />;
}