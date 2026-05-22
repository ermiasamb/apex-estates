'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PropertySearchForm } from '@/components/properties/PropertySearchForm';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Recommendations } from '@/components/properties/Recommendations';
import placeholderImagesData from '@/lib/placeholder-images.json';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fetchFeaturedProperties, mapApiProperty } from '@/services/property-service';

const heroImage = placeholderImagesData.placeholderImages.find(p => p.id === 'hero-image');

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const response = await fetchFeaturedProperties();
        if (response && response.items && response.items.length > 0) {
          const mapped = response.items.map(mapApiProperty);
          setFeaturedProperties(mapped);
        } else {
          setFeaturedProperties([]);
        }
      } catch (error) {
        console.error("Failed to load live featured properties:", error);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <section className="relative h-[60vh] min-h-[400px] md:h-[70vh] md:min-h-[600px] w-full flex items-center justify-center flex-col">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            priority
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-shadow-lg">
            Find Your Dream Home
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-neutral-200 text-shadow">
            Discover a curated selection of the finest properties for sale and rent. Your next chapter starts here.
          </p>
        </div>
        <div className="relative z-10 w-full max-w-5xl mt-8 px-4">
            <PropertySearchForm />
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-semibold">Featured Properties</h2>
          <p className="max-w-2xl text-muted-foreground">
            Explore a collection of our most sought-after properties, handpicked for their quality and value.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-[380px] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className='rounded-full'>
                <Link href="/search">View All Properties</Link>
            </Button>
        </div>
      </section>
      
      <Recommendations />

    </div>
  );
}
