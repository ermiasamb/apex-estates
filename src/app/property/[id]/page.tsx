import { properties, brokers, amenities as allAmenities } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Bath, SquareGanttChart, MapPin, Building, CalendarDays, Phone, Mail } from 'lucide-react';
import { PhotoGallery } from '@/components/properties/PhotoGallery';
import { PropertyMap } from '@/components/properties/PropertyMap';
import { FavoriteButton } from '@/components/properties/FavoriteButton';
import { TrackView } from '@/components/properties/TrackView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return properties.map((property) => ({
    id: property.id,
  }));
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === params.id);

  if (!property) {
    notFound();
  }

  const broker = brokers.find((b) => b.id === property.brokerId);
  const brokerAvatar = placeholderImages.find(p => p.id === broker?.avatarId);
  const floorPlanImage = placeholderImages.find(p => p.id === property.floorPlanId);

  const formatPrice = (price: number) => {
    if (property.type === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const propertyAmenities = allAmenities.filter(a => property.amenities.includes(a.name));

  return (
    <>
    <TrackView propertyId={property.id} />
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">{property.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <MapPin className="w-4 h-4" />
            <span>{property.address}</span>
          </div>
        </div>
        
        {/* Gallery */}
        <PhotoGallery imageIds={property.imageIds} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Details & Description */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-headline">About this property</CardTitle>
                    <p className="font-semibold text-3xl text-primary mt-2">{formatPrice(property.price)}</p>
                  </div>
                  <FavoriteButton propertyId={property.id} className="h-12 w-12" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-muted-foreground my-4">
                  <div className="flex items-center gap-2"><BedDouble className="w-5 h-5 text-primary" />{property.bedrooms} Beds</div>
                  <div className="flex items-center gap-2"><Bath className="w-5 h-5 text-primary" />{property.bathrooms} Baths</div>
                  <div className="flex items-center gap-2"><SquareGanttChart className="w-5 h-5 text-primary" />{property.area.toLocaleString()} sqft</div>
                  <div className="flex items-center gap-2"><Building className="w-5 h-5 text-primary" />For {property.type}</div>
                  <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" />Status: <Badge variant="outline" className='capitalize'>{property.status}</Badge></div>
                </div>
                <Separator className="my-4" />
                <p>{property.description}</p>
              </CardContent>
            </Card>
            
            {/* Amenities */}
            <Card>
              <CardHeader><CardTitle className="font-headline text-2xl">Amenities</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {propertyAmenities.map(amenity => (
                  <div key={amenity.name} className="flex items-center gap-3">
                    <amenity.icon className="w-5 h-5 text-primary" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Floor Plan & Video */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {floorPlanImage && (
                <Card>
                    <CardHeader><CardTitle className="font-headline text-2xl">Floor Plan</CardTitle></CardHeader>
                    <CardContent>
                    <Image src={floorPlanImage.imageUrl} alt="Floor Plan" width={800} height={600} className="rounded-md w-full" data-ai-hint={floorPlanImage.imageHint} />
                    </CardContent>
                </Card>
                )}
                {property.videoUrl && (
                <Card>
                    <CardHeader><CardTitle className="font-headline text-2xl">Video Tour</CardTitle></CardHeader>
                    <CardContent>
                    <div className="aspect-video">
                        <iframe
                            className="w-full h-full rounded-md"
                            src={property.videoUrl}
                            title="Property Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    </CardContent>
                </Card>
                )}
            </div>

            {/* Map */}
            <Card>
              <CardHeader><CardTitle className="font-headline text-2xl">Location</CardTitle></CardHeader>
              <CardContent className="h-96 rounded-md overflow-hidden">
                <PropertyMap properties={[property]} />
              </CardContent>
            </Card>
          </div>

          {/* Broker Info Sidebar */}
          <div className="lg:col-span-1">
            {broker && (
              <Card className="sticky top-24">
                <CardHeader className="text-center">
                    {brokerAvatar &&
                        <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage src={brokerAvatar.imageUrl} alt={broker.name} data-ai-hint={brokerAvatar.imageHint}/>
                            <AvatarFallback>{broker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    }
                  <CardTitle className="font-headline text-2xl">{broker.name}</CardTitle>
                  <p className="text-muted-foreground">Listing Agent</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" asChild>
                    <a href={`tel:${broker.phone}`}><Phone className='mr-2' />{broker.phone}</a>
                  </Button>
                  <Button className="w-full" variant="secondary" asChild>
                    <a href={`mailto:${broker.email}`}><Mail className='mr-2' />Email Agent</a>
                  </Button>
                  <Separator />
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/broker/${broker.id}`}>View Profile & Listings</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
