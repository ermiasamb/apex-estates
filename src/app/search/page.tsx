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
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/properties/PropertyMap').then(m => m.PropertyMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    type: (searchParams.get('type') as 'sale' | 'rent' | 'all' | null) || 'all',
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
      const matchesBedrooms = bedrooms === 'any' || property.bedrooms >= Number(bedrooms.replace('+', ''));
      const matchesBathrooms = bathrooms === 'any' || property.bathrooms >= Number(bathrooms.replace('+', ''));
      const matchesNearby = nearby.length === 0 || nearby.every(amenity => property.nearbyPlaces?.some(place => place.type === amenity));
      
      return matchesQuery && matchesType && matchesPrice && matchesBedrooms && matchesBathrooms && matchesNearby;
    });
  }, [filters]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="container mx-auto px-4 pt-4 border-b">
        <PropertyFilters filters={filters} setFilters={setFilters} />
        <div className="flex justify-between items-center my-4">
          <div>
            <h1 className="text-xl font-headline font-semibold">
                Real Estate & Homes For Sale
            </h1>
            <p className="text-muted-foreground text-sm">{filteredProperties.length} results</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
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
      </div>
      
      {viewMode === 'list' ? (
        <ScrollArea className="flex-grow">
            <div className="container mx-auto px-4 py-6">
                {filteredProperties.length > 0 ? (
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
                )}
            </div>
        </ScrollArea>
      ) : (
        <div className="flex-grow flex">
          <ScrollArea className="w-full lg:w-3/5 xl:w-1/2">
            <div className='p-4'>
                 {filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted rounded-lg">
                        <h2 className="text-xl font-semibold">No properties found</h2>
                        <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
                    </div>
                )}
            </div>
          </ScrollArea>
          <div className="hidden lg:block lg:w-2/5 xl:w-1/2 h-full">
            <PropertyMap properties={filteredProperties} />
          </div>
        </div>
      )}
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
            <div className="flex flex-col gap-8">
                <Skeleton className="h-12 w-full" />
                <main>
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
