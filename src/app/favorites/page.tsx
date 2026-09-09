'use client';
import { useState, useEffect } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProperties, mapApiProperty } from '@/services/property-service';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetchProperties({ limit: 100 });
        if (response && response.items) {
          const mapped = response.items.map(mapApiProperty);
          const filtered = mapped.filter((p: any) => favorites.includes(p.id));
          setFavoriteProperties(filtered);
        }
      } catch (error) {
        console.error("Failed to load favorite properties:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [favorites]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Your Favorite Properties</h1>
        <p className="text-muted-foreground mt-2">
          You have {favoriteProperties.length} saved propert{favoriteProperties.length === 1 ? 'y' : 'ies'}.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-muted rounded-lg">
            <Heart className="w-16 h-16 text-primary/20 mb-4" />
            <h2 className="text-2xl font-semibold">You have no saved properties</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Click the heart icon on any property to save it here for later.
            </p>
            <Button asChild className="mt-6">
                <Link href="/search">Start Searching</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
