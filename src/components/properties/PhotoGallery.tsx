'use client';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images.json';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { ImageCategory, ImagePlaceholder } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PhotoGalleryProps {
  imageIds: string[];
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {api?.scrollSnapList().map((_, index) => (
                <button 
                    key={index}
                    onClick={() => api.scrollTo(index)}
                    className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        api.selectedScrollSnap() === index ? 'w-6 bg-white' : 'bg-white/50'
                    )}
                    aria-label={`Go to image ${index + 1}`}
                />
            ))}
        </div>
    );
}

export function PhotoGallery({ imageIds }: PhotoGalleryProps) {
  const allImages = useMemo(() => imageIds.map(id => placeholderImages.find(p => p.id === id)).filter((p): p is ImagePlaceholder => Boolean(p)), [imageIds]);
  
  const categories = useMemo(() => {
    const cats = allImages.reduce((acc, image) => {
        if(image.category !== 'plan'){
             acc.add(image.category);
        }
        return acc;
    }, new Set<ImageCategory>());
    return ['all', ...Array.from(cats)];
  }, [allImages]);

  const [activeCategory, setActiveCategory] = useState<ImageCategory | 'all'>('all');

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return allImages.filter(img => img.category !== 'plan');
    return allImages.filter(img => img.category === activeCategory);
  }, [activeCategory, allImages]);


  if (allImages.length === 0) {
    return null;
  }
  
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');

  return (
    <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ImageCategory)} className="w-full">
      <TabsList className="mb-4 bg-muted">
        {categories.map(category => (
          <TabsTrigger key={category} value={category}>{capitalize(category)}</TabsTrigger>
        ))}
      </TabsList>
      
        <TabsContent value={activeCategory}>
            <Carousel className="w-full" key={activeCategory} opts={{ loop: true }}>
            <CarouselContent>
                {filteredImages.map((image, index) => (
                image && (
                    <CarouselItem key={image.id}>
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
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-0 bg-black/30 p-0 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-0 bg-black/30 p-0 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black" />
            <CarouselDots />
            </Carousel>
        </TabsContent>
    </Tabs>
  );
}
