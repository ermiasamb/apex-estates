'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import { getRecommendationsAction } from '@/app/actions';
import { PropertyCard } from './PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchProperties, mapApiProperty } from '@/services/property-service';

export function Recommendations() {
  const { history } = useBrowsingHistory();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    if (history.length === 0) {
      // Don't fetch if there's no history
      return;
    }

    setLoading(true);
    setHasFetched(true);
    
    // For now, preferences are hardcoded. In a real app, this would come from a user profile.
    const preferences = {
      location: "CA",
      priceRange: "any",
      type: "sale"
    };

    try {
      const recommendedIds = await getRecommendationsAction(
        JSON.stringify(history),
        JSON.stringify(preferences)
      );

      if (recommendedIds && recommendedIds.length > 0) {
        // Fetch all properties from API and filter by recommended IDs
        const response = await fetchProperties({ limit: 100 });
        if (response && response.items) {
          const mapped = response.items.map(mapApiProperty);
          const recommendedProperties = mapped.filter((p: any) => recommendedIds.includes(p.id));
          setRecommendations(recommendedProperties);
        } else {
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [history]);

  useEffect(() => {
    // Automatically fetch recommendations if there's sufficient browsing history.
    if (history.length >= 2 && !hasFetched) {
      fetchRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, hasFetched]);

  if (!hasFetched && history.length === 0) {
    return (
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-12 text-center">
            <Wand2 className="mx-auto h-12 w-12 text-primary/50 mb-4" />
            <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-2">Personalized For You</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mb-4">As you browse properties, we'll learn what you like and show you personalized recommendations here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h2 className="text-3xl md:text-4xl font-headline font-semibold">Recommended For You</h2>
                <p className="max-w-2xl text-muted-foreground mt-1">
                    Based on your activity, you might be interested in these properties.
                </p>
            </div>
            <Button onClick={fetchRecommendations} disabled={loading || history.length === 0}>
                <Wand2 className="mr-2 h-4 w-4" />
                {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[225px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : hasFetched ? (
           <div className="text-center py-8">
                <p className="text-muted-foreground">We couldn't find any recommendations right now. Keep browsing to get started!</p>
           </div>
        ) : null}
      </div>
    </section>
  );
}
