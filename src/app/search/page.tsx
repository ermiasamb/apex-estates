'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { properties as allProperties } from '@/lib/data';
import type { Property } from '@/lib/types';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/properties/PropertyMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[60vh] lg:h-full w-full rounded-lg" />
});


function SearchPageContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    type: (searchParams.get('type') as 'sale' | 'rent' | 'all' | null),
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || Infinity,
    bedrooms: 'any',
    bathrooms: 'any',
    nearby: [] as string[],
  });

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      const { query, type, minPrice, maxPrice, bedrooms, bathrooms, nearby } = filters;
      
      const queryLower = query.toLowerCase();
      const matchesQuery = !query || property.title.toLowerCase().includes(queryLower) || property.location.toLowerCase().includes(queryLower) || property.address.toLowerCase().includes(queryLower);
      const matchesType = !type || type === 'all' || property.type === type;
      const matchesPrice = property.price >= minPrice && (maxPrice === Infinity || property.price <= maxPrice);
      const matchesBedrooms = bedrooms === 'any' || property.bedrooms >= Number(bedrooms);
      const matchesBathrooms = bathrooms === 'any' || property.bathrooms >= Number(bathrooms);
      const matchesNearby = nearby.length === 0 || nearby.every(amenity => property.nearbyPlaces?.some(place => place.type === amenity));
      
      return matchesQuery && matchesType && matchesPrice && matchesBedrooms && matchesBathrooms && matchesNearby;
    });
  }, [filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4 xl:w-1/5">
          <PropertyFilters filters={filters} setFilters={setFilters} />
        </aside>

        <main className="w-full lg:w-3/4 xl:w-4/5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-headline font-semibold">
                {filters.type && filters.type !== 'all' ? `${filters.type === 'sale' ? 'Homes For Sale' : 'Apartments For Rent'}` : 'All Properties'}
              </h1>
              <p className="text-muted-foreground">{filteredProperties.length} results found</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 p-1 bg-muted rounded-lg">
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
                    <List className="h-4 w-4 mr-2" />
                    List
                </Button>
                <Button variant={viewMode === 'map' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('map')}>
                    <Map className="h-4 w-4 mr-2" />
                    Map
                </Button>
            </div>
          </div>
          
          {viewMode === 'list' ? (
            filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted rounded-lg">
                    <h2 className="text-xl font-semibold">No properties found</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
                </div>
            )
          ) : (
            <div className="h-[60vh] lg:h-full w-full rounded-lg overflow-hidden border">
              <PropertyMap properties={filteredProperties} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchPageContent />
        </Suspense>
    )
}

function SearchPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-1/4 xl:w-1/5">
                    <Skeleton className="h-[600px] w-full" />
                </aside>
                <main className="w-full lg:w-3/4 xl:w-4/5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                             <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[225px] w-full rounded-xl" />
                                <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
