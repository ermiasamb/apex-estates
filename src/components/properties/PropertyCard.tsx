'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, SquareGanttChart, MapPin, Lock } from 'lucide-react';
import type { Property } from '@/lib/types';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { FavoriteButton } from './FavoriteButton';
import { Carousel, CarouselContent, CarouselItem, useCarousel, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import React from 'react';

interface PropertyCardProps {
  property: Property;
}

function CarouselDots() {
    const { api } = useCarousel();
    const [_, setSelected] = React.useState(0);
    
    React.useEffect(() => {
        if (api) {
            const onSelect = () => {
                setSelected(api.selectedScrollSnap());
            };
            api.on('select', onSelect);
            onSelect(); 
            return () => {
                api.off('select', onSelect);
            };
        }
    }, [api]);

    return (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {api?.scrollSnapList().map((_, index) => (
                <button 
                    key={index}
                    onClick={() => api.scrollTo(index)}
                    className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        api.selectedScrollSnap() === index ? 'w-4 bg-white' : 'bg-white/50'
                    )}
                />
            ))}
        </div>
    );
}


export function PropertyCard({ property }: PropertyCardProps) {
  // Filter out empty image URLs from the API response
  const validImages = property.images?.filter((url): url is string => typeof url === 'string' && !!url && url.trim().length > 0) || [];
  
  const images = validImages.length > 0
    ? validImages.map((url, index) => ({
        imageUrl: url,
        description: `${property.title} image ${index + 1}`,
        imageHint: property.category,
      }))
    : property.imageIds
        .map(id => placeholderImagesData.placeholderImages.find(p => p.id === id))
        .filter((img): img is typeof placeholderImagesData.placeholderImages[0] => !!img && !!img.imageUrl && img.imageUrl.trim().length > 0);

  const displayImages = images.length > 0
    ? images
    : placeholderImagesData.placeholderImages
        .filter(image => image.id.startsWith('property-') && image.imageUrl && image.imageUrl.trim().length > 0)
        .slice(0, 1);

  const formatPrice = (price: number) => {
    if (property.type === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden group transition-all duration-300 border-none shadow-md hover:shadow-2xl rounded-xl">
      <CardHeader className="p-0 relative">
        <Carousel className="w-full group" opts={{ loop: true }}>
          <CarouselContent>
            {displayImages.length > 0 ? (
              displayImages.map((image, index) => (
                <CarouselItem key={index}>
                  <Link href={`/property/${property.id}`} className="block overflow-hidden">
                    <div className="aspect-[4/3] w-full relative">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        unoptimized={Boolean(validImages.length)}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        data-ai-hint={image.imageHint}
                        priority={index === 0}
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </Link>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="aspect-[4/3] w-full relative bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">No images available</p>
                  </div>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/80 p-0 text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white disabled:opacity-0" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/80 p-0 text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white disabled:opacity-0" />
          <CarouselDots />
        </Carousel>

        <div className="absolute top-3 right-3 z-10">
            <FavoriteButton propertyId={property.id} />
        </div>
         <div className="absolute top-3 left-3 z-10">
             <Badge variant={property.type === 'sale' ? 'default' : 'secondary'} className="capitalize shrink-0">
                For {property.type}
            </Badge>
        </div>
      </CardHeader>
      <Link href={`/property/${property.id}`} className="flex flex-col flex-grow">
        <CardContent className="p-4 flex-grow">
            <p className="font-semibold text-lg truncate" title={property.title}>
                {property.title}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{property.address}</span>
            </div>
            <p className="font-bold text-xl mt-2">{formatPrice(property.price)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-primary/70" />
                    <span className="font-medium text-foreground">{property.bedrooms}</span>
                    <span className='hidden sm:inline'>Beds</span>
                </div>
                <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-primary/70" />
                    <span className="font-medium text-foreground">{property.bathrooms}</span>
                    <span className='hidden sm:inline'>Baths</span>
                </div>
                <div className="flex items-center gap-2">
                    <SquareGanttChart className="w-5 h-5 text-primary/70" />
                    <span className="font-medium text-foreground">{property.area.toLocaleString()}</span>
                    <span className='hidden sm:inline'>sqft</span>
                </div>
            </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
