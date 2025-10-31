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
      <section className="relative h-[60vh] min-h-[500px] w-full">
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
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold">
            Find Your Dream Home
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-neutral-200">
            Discover a curated selection of the finest properties for sale and rent. Your next chapter starts here.
          </p>
          <Card className="w-full max-w-4xl bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 md:p-6">
              <PropertySearchForm />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-headline font-semibold">Featured Properties</h2>
          <p className="max-w-2xl text-muted-foreground">
            Explore a collection of our most sought-after properties, handpicked for their quality and value.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="text-center mt-8">
            <Button asChild size="lg">
                <Link href="/search">View All Properties</Link>
            </Button>
        </div>
      </section>
      
      <Recommendations />

    </div>
  );
}
