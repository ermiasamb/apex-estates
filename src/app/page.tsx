'use client';
import Image from 'next/image';
import { PropertySearchForm } from '@/components/properties/PropertySearchForm';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { properties } from '@/lib/data';
import { Recommendations } from '@/components/properties/Recommendations';
import { placeholderImages } from '@/lib/placeholder-images.json';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const heroImage = placeholderImages.find(p => p.id === 'hero-image');

export default function Home() {
  const featuredProperties = properties.slice(0, 6);

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <section className="relative h-[70vh] min-h-[500px] w-full flex items-center justify-center">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 text-center text-white p-4 mt-auto w-full">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-shadow-lg">
            Find Your Dream Home
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-neutral-200 text-shadow">
            Discover a curated selection of the finest properties for sale and rent. Your next chapter starts here.
          </p>
          <Card className="w-full max-w-4xl bg-background/90 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardContent className="p-4 md:p-6">
              <PropertySearchForm />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-semibold">Featured Properties</h2>
          <p className="max-w-2xl text-muted-foreground">
            Explore a collection of our most sought-after properties, handpicked for their quality and value.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
                <Link href="/search">View All Properties</Link>
            </Button>
        </div>
      </section>
      
      <Recommendations />

    </div>
  );
}
