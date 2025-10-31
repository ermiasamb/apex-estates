
'use client';
import { properties, brokers, amenities as allAmenities } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Bath, SquareGanttChart, MapPin, Building, CalendarDays, Phone, Mail, School, Hospital, Utensils as UtensilsIcon, Eye } from 'lucide-react';
import { PhotoGallery } from '@/components/properties/PhotoGallery';
import { FavoriteButton } from '@/components/properties/FavoriteButton';
import { TrackView } from '@/components/properties/TrackView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MortgageCalculator } from '@/components/properties/MortgageCalculator';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PropertyMap = dynamic(() => import('@/components/properties/PropertyMap').then(mod => mod.PropertyMap), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />
});

// This is now a client component, but we can still fetch data on the server
// by moving the data fetching logic to a server component and passing props,
// or by fetching on the client (which we will do for simplicity here as data is static).
// Note: generateStaticParams is not used in client components. We'll find another way to get the property.

const placeIcons = {
    hospital: <Hospital className="w-5 h-5 text-primary" />,
    school: <School className="w-5 h-5 text-primary" />,
    restaurant: <UtensilsIcon className="w-5 h-5 text-primary" />,
};

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
      <div className="bg-muted/20">
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">{property.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{property.address}</span>
                </div>
            </div>
            
            {/* Gallery */}
            <div className='mb-8'>
                <PhotoGallery imageIds={property.imageIds} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Details Card */}
                    <Card className="overflow-hidden">
                        <CardHeader className='bg-muted/50'>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl font-headline">Property Details</CardTitle>
                                <Badge variant="outline" className='capitalize text-base'>{property.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <p className="font-semibold text-4xl text-primary">{formatPrice(property.price)}</p>
                                <FavoriteButton propertyId={property.id} className="h-12 w-12" />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center my-6">
                                <div className="p-3 bg-muted/50 rounded-lg"><BedDouble className="w-6 h-6 text-primary mx-auto mb-1" />{property.bedrooms} Beds</div>
                                <div className="p-3 bg-muted/50 rounded-lg"><Bath className="w-6 h-6 text-primary mx-auto mb-1" />{property.bathrooms} Baths</div>
                                <div className="p-3 bg-muted/50 rounded-lg"><SquareGanttChart className="w-6 h-6 text-primary mx-auto mb-1" />{property.area.toLocaleString()} sqft</div>
                                <div className="p-3 bg-muted/50 rounded-lg"><Building className="w-6 h-6 text-primary mx-auto mb-1" />For {property.type}</div>
                            </div>

                            <Separator className="my-6" />

                            <div className="prose prose-lg max-w-none text-foreground/90">
                                <h3 className='font-headline text-xl mb-2'>Description</h3>
                                <p>{property.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                     {/* Amenities Card */}
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-2xl">Amenities</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                            {propertyAmenities.map(amenity => (
                            <div key={amenity.name} className="flex items-center gap-3">
                                <amenity.icon className="w-5 h-5 text-primary" />
                                <span className="font-medium">{amenity.name}</span>
                            </div>
                            ))}
                        </CardContent>
                    </Card>

                    {property.vrTourUrl && (
                        <Card>
                            <CardHeader><CardTitle className="font-headline text-2xl flex items-center gap-2"><Eye/> 360° Virtual Tour</CardTitle></CardHeader>
                            <CardContent>
                                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                                    <iframe
                                        className="w-full h-full"
                                        src={property.vrTourUrl}
                                        title="360 Virtual Tour"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* Media Grid */}
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
                                        <iframe className="w-full h-full rounded-md" src={property.videoUrl} title="Property Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="font-headline text-2xl">What's Nearby?</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {property.nearbyPlaces.map(place => (
                                    <div key={place.name} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                        {placeIcons[place.type]}
                                        <div>
                                            <p className="font-semibold">{place.name}</p>
                                            <p className="text-sm text-muted-foreground">{place.distance} away</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Map */}
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-2xl">Location</CardTitle></CardHeader>
                        <CardContent className="h-96 rounded-lg overflow-hidden">
                            <PropertyMap properties={[property]} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    {broker && (
                        <Card className="sticky top-24">
                            <CardHeader className="text-center">
                                {brokerAvatar &&
                                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                                        <AvatarImage src={brokerAvatar.imageUrl} alt={broker.name} data-ai-hint={brokerAvatar.imageHint}/>
                                        <AvatarFallback>{broker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                }
                                <CardTitle className="font-headline text-2xl">{broker.name}</CardTitle>
                                <p className="text-muted-foreground">Listing Agent</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full" asChild size="lg">
                                    <a href={`tel:${broker.phone}`}><Phone className='mr-2' />{broker.phone}</a>
                                </Button>
                                <Button className="w-full" variant="secondary" asChild size="lg">
                                    <a href={`mailto:${broker.email}`}><Mail className='mr-2' />Email Agent</a>
                                </Button>
                                <Separator />
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href={`/broker/${broker.id}`}>View Profile & Listings</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    {property.type === 'sale' && <MortgageCalculator propertyPrice={property.price} />}
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
