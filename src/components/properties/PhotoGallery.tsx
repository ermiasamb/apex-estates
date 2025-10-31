'use client';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface PhotoGalleryProps {
  imageIds: string[];
}

export function PhotoGallery({ imageIds }: PhotoGalleryProps) {
  const images = imageIds.map(id => placeholderImages.find(p => p.id === id)).filter(Boolean);

  if (images.length === 0) {
    return null;
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          image && (
            <CarouselItem key={index}>
              <div className="aspect-video md:aspect-[2.4/1] relative w-full overflow-hidden rounded-lg">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  data-ai-hint={image.imageHint}
                />
              </div>
            </CarouselItem>
          )
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
