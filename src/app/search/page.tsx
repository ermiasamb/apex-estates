'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters, type FilterState } from '@/components/properties/PropertyFilters';
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { fetchProperties, mapApiProperty } from '@/services/property-service';

const PropertyMap = dynamic(() => import('@/components/properties/PropertyMap').then(m => m.PropertyMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

function SearchPageContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('q') || '',
    type: (searchParams.get('type') as 'sale' | 'rent' | 'all' | null) || 'all',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || Infinity,
    bedrooms: 'any',
    bathrooms: 'any',
    nearby: [] as string[],
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Sync filters from URL search params whenever they change (handles soft navigation)
  useEffect(() => {
    setFilters({
      query: searchParams.get('q') || '',
      type: (searchParams.get('type') as 'sale' | 'rent' | 'all' | null) || 'all',
      minPrice: Number(searchParams.get('minPrice')) || 0,
      maxPrice: Number(searchParams.get('maxPrice')) || Infinity,
      bedrooms: 'any',
      bathrooms: 'any',
      nearby: [] as string[],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const response = await fetchProperties(filters);
        if (response && response.items && response.items.length > 0) {
          const mapped = response.items.map(mapApiProperty);
          setProperties(mapped);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
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
            <p className="text-muted-foreground text-sm">{properties.length} results</p>
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
      
      {loading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <ScrollArea className="flex-grow">
            <div className="container mx-auto px-4 py-6">
                {properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((property) => (
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
                 {properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((property) => (
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
            <PropertyMap properties={properties} />
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