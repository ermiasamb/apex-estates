'use client';
import Image from 'next/image';
import placeholderImagesData from '@/lib/placeholder-images.json';
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
import React, { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface PhotoGalleryProps {
  imageIds: string[];
  images?: Array<{ url: string; category?: string }> | string[];
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

// Lightbox Modal Component
function LightboxModal({ 
  images, 
  initialIndex = 0, 
  onClose 
}: { 
  images: Array<{ url: string; alt: string }>, 
  initialIndex?: number,
  onClose: () => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      {/* Image Container */}
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center">
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          className="max-w-full max-h-full object-contain"
        />

        {/* Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Keyboard Info */}
        <div className="absolute bottom-4 left-4 text-white/60 text-xs">
          <p>← → to navigate • ESC to close</p>
        </div>
      </div>
    </div>
  );
}

export function PhotoGallery({ imageIds, images }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages = useMemo(() => {
    if (images?.length) {
      return images.map((item, index) => {
        // Handle both string URLs and objects with category
        if (typeof item === 'string') {
          return {
            id: `api-image-${index}`,
            imageUrl: item,
            description: `Property image ${index + 1}`,
            imageHint: 'property',
            category: 'exterior' as ImageCategory,
          };
        } else {
          return {
            id: `api-image-${index}`,
            imageUrl: item.url,
            description: `Property image ${index + 1}`,
            imageHint: 'property',
            category: (item.category || 'exterior').toLowerCase().replace(/\s+/g, '-') as ImageCategory,
          };
        }
      });
    }

    return imageIds.map(id => placeholderImagesData.placeholderImages.find(p => p.id === id)).filter((p): p is ImagePlaceholder => Boolean(p));
  }, [imageIds, images]);
  
  const categories = useMemo(() => {
    const cats = allImages.reduce((acc, image) => {
        if(image.category !== 'plan'){
             acc.add(image.category);
        }
        return acc;
    }, new Set<ImageCategory>());
    return ['all', ...Array.from(cats).sort()];
  }, [allImages]);

  const [activeCategory, setActiveCategory] = useState<ImageCategory | 'all'>('all');

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return allImages.filter(img => img.category !== 'plan');
    return allImages.filter(img => img.category === activeCategory);
  }, [activeCategory, allImages]);


  if (allImages.length === 0) {
    return null;
  }
  
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxImages = filteredImages.map(img => ({
    url: img.imageUrl,
    alt: img.description,
  }));

  return (
    <>
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ImageCategory)} className="w-full">
        {/* Scrollable TabsList */}
        <div className="relative w-full mb-4">
          <div className="overflow-x-auto rounded-lg bg-muted p-1">
            <TabsList className="bg-transparent inline-flex w-max gap-1">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {capitalize(category)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
        
        <TabsContent value={activeCategory}>
            <div className="relative">
              <Carousel className="w-full" key={activeCategory} opts={{ loop: true }}>
                <CarouselContent>
                    {filteredImages.map((image, index) => (
                    image && (
                        <CarouselItem key={image.id}>
                        <div 
                          className="aspect-video md:aspect-[2.4/1] relative w-full overflow-hidden rounded-lg bg-muted group"
                        >
                            <img
                            src={image.imageUrl}
                            alt={image.description}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Zoom Icon - Top Right Corner */}
                            <button
                              onClick={() => openLightbox(index)}
                              className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white rounded-md p-2 transition-all z-20 flex items-center justify-center"
                              aria-label="View fullscreen"
                              title="Click to view fullscreen"
                            >
                              <Maximize2 className="w-5 h-5" />
                            </button>
                        </div>
                        </CarouselItem>
                    )
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-0 bg-black/30 p-0 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-0 bg-black/30 p-0 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black" />
                <CarouselDots />
              </Carousel>
            </div>
        </TabsContent>
      </Tabs>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
