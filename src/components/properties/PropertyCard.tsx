import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, SquareGanttChart, MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { FavoriteButton } from './FavoriteButton';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const firstImageId = property.imageIds[0];
  const image = placeholderImages.find(p => p.id === firstImageId);

  const formatPrice = (price: number) => {
    if (property.type === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <CardHeader className="p-0 relative">
        <Link href={`/property/${property.id}`} className="block overflow-hidden">
          <div className="aspect-[4/3] w-full relative">
            {image ? (
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                data-ai-hint={image.imageHint}
              />
            ) : (
              <div className="bg-muted w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </Link>
        <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant={property.type === 'sale' ? 'default' : 'secondary'} className="capitalize bg-primary/90 backdrop-blur-sm text-primary-foreground border-primary/50">
                For {property.type}
            </Badge>
        </div>
        <div className="absolute top-3 right-3">
            <FavoriteButton propertyId={property.id} />
        </div>
         <div className="absolute bottom-4 left-4">
            <p className="font-bold text-2xl text-white text-shadow">{formatPrice(property.price)}</p>
        </div>
      </CardHeader>
      <Link href={`/property/${property.id}`} className="flex flex-col flex-grow">
        <CardContent className="p-4 flex-grow">
            <CardTitle className="text-xl font-headline font-bold mt-1 mb-2 truncate" title={property.title}>
                {property.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{property.address}</span>
            </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/30 border-t">
            <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-primary/70" />
                <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-primary/70" />
                <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-2">
                <SquareGanttChart className="w-5 h-5 text-primary/70" />
                <span>{property.area.toLocaleString()} sqft</span>
            </div>
            </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
