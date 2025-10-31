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
    <Card className="flex flex-col h-full overflow-hidden group transition-all duration-300 border-none shadow-none hover:shadow-2xl rounded-xl">
      <CardHeader className="p-0 relative">
        <Link href={`/property/${property.id}`} className="block overflow-hidden rounded-xl">
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
          </div>
        </Link>
        <div className="absolute top-3 right-3">
            <FavoriteButton propertyId={property.id} />
        </div>
      </CardHeader>
      <Link href={`/property/${property.id}`} className="flex flex-col flex-grow">
        <CardContent className="p-4 flex-grow">
            <div className='flex justify-between items-start'>
                <p className="font-semibold text-lg truncate" title={property.title}>
                    {property.title}
                </p>
                <Badge variant={property.type === 'sale' ? 'default' : 'secondary'} className="capitalize shrink-0">
                    For {property.type}
                </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{property.address}</span>
            </div>
            <p className="font-bold text-lg mt-2">{formatPrice(property.price)}</p>
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
