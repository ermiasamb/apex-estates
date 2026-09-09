'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
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

const ITEMS_PER_PAGE = 100;

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync filters from URL search params whenever they change
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
    setPage(1);
    setProperties([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load initial properties
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const response = await fetchProperties({ ...filters, page: 1, limit: ITEMS_PER_PAGE });
        if (response && response.items && response.items.length > 0) {
          const mapped = response.items.map(mapApiProperty);
          setProperties(mapped);
          setHasMore(mapped.length === ITEMS_PER_PAGE);
          setPage(2);
        } else {
          setProperties([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, [filters]);

  // Load more properties (lazy loading)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await fetchProperties({ ...filters, page, limit: ITEMS_PER_PAGE });
      if (response && response.items && response.items.length > 0) {
        const mapped = response.items.map(mapApiProperty);
        setProperties(prev => [...prev, ...mapped]);
        setHasMore(mapped.length === ITEMS_PER_PAGE);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more properties:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, filters, hasMore, isLoadingMore]);

  // Intersection Observer for infinite scroll in left panel
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = scrollRef.current?.querySelector('.scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loadMore, hasMore, isLoadingMore]);

  return (
    <div className="flex flex-col min-h-screen">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                {/* Load more trigger */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMore} disabled={isLoadingMore}>
                      {isLoadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
            </div>
        </ScrollArea>
      ) : (
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
          {/* Fixed 600px height container for map view */}
          <div className="flex gap-4 h-[600px]">
            {/* Left side - scrollable properties list with own scrollbar */}
            <div ref={scrollRef} className="w-full lg:w-2/5 xl:w-1/2 overflow-y-auto overflow-x-hidden border rounded-lg">
              {properties.length > 0 ? (
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                  {/* Sentinel element for infinite scroll */}
                  <div className="scroll-sentinel h-4 mt-4" />
                  
                  {/* Loading indicator */}
                  {isLoadingMore && (
                    <div className="flex justify-center mt-4">
                      <div className="animate-spin">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted rounded-lg m-4">
                  <h2 className="text-xl font-semibold">No properties found</h2>
                  <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
            
            {/* Right side - fixed map */}
            <div className="hidden lg:block lg:w-3/5 xl:w-1/2 h-full rounded-lg overflow-hidden border">
              <PropertyMap properties={properties} />
            </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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