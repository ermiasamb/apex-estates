'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Bath, SquareGanttChart, MapPin, Building, CalendarDays, Phone, Mail, School, Hospital, Utensils as UtensilsIcon, Eye, History, Share2, Heart, Home, Wifi, ParkingSquare, PawPrint, VenetianMask, Utensils, Droplets, Snowflake, Dumbbell, Sun, Lock } from 'lucide-react';
import { PhotoGallery } from '@/components/properties/PhotoGallery';
import { FavoriteButton } from './FavoriteButton';
import { TrackView } from '@/components/properties/TrackView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AskQuestionForm } from './AskQuestionForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ShareDialog } from './ShareDialog';
import dynamic from 'next/dynamic';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { PublicRestrictionOverlay } from './PublicRestrictionOverlay';

const PropertyMap = dynamic(() => import('@/components/properties/PropertyMap').then(m => m.PropertyMap), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />
});

const MortgageCalculator = dynamic(() => import('@/components/properties/MortgageCalculator').then(m => m.MortgageCalculator), {
    ssr: false,
    loading: () => (
        <Card>
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    ),
});

const EnvironmentalInfo = dynamic(() => import('./EnvironmentalInfo').then(m => m.EnvironmentalInfo), {
    loading: () => (
        <Card>
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    ),
});

const PriceHistoryChart = dynamic(() => import('./PriceHistoryChart').then(m => m.PriceHistoryChart), {
    loading: () => <Skeleton className="h-64 w-full" />,
});

const amenityIcons: Record<string, LucideIcon> = {
  WiFi: Wifi,
  Parking: ParkingSquare,
  'Pet Friendly': PawPrint,
  Balcony: VenetianMask,
  Kitchen: Utensils,
  Pool: Droplets,
  'Generator Backup': Snowflake,
  Gym: Dumbbell,
  'Rooftop Deck': Sun,
};

const placeIcons: Record<string, React.ReactElement> = {
    hospital: <Hospital className="w-5 h-5 text-primary" />,
    school: <School className="w-5 h-5 text-primary" />,
    restaurant: <UtensilsIcon className="w-5 h-5 text-primary" />,
};

export function PropertyDetail({ property }: { property: Property }) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const broker = property.broker || null;

  const formatPrice = (price: number) => {
    if (property.type === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const propertyAmenities = (property.amenities || [])
    .map(name => ({ name, icon: amenityIcons[name] }))
    .filter(a => a.icon);

  const hasPrice = !!property.price;
  const hasContactInfo = !!broker && (!!broker.phone || !!broker.email);

  return (
    <>
      <TrackView propertyId={property.id} />
      <div className="bg-background">
        {/* Gallery */}
        <div className='container mx-auto px-4 pt-8'>
            <PhotoGallery imageIds={property.imageIds} images={property.images} />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{property.title}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                    <MapPin className="w-5 h-5" />
                                    <span className="text-base hover:underline cursor-pointer">
                                      {property.address}
                                      {!hasPrice && <Lock className="w-3 h-3 inline-block ml-1 text-muted-foreground/50" />}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShareDialog property={property} />
                                <FavoriteButton propertyId={property.id} className="h-12 w-12 bg-card border shadow-sm" />
                            </div>
                        </div>

                         {/* Details Bar */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-foreground text-sm">
                            <div className="flex items-center gap-2"><BedDouble className="w-5 h-5 text-primary"/> <span>{property.bedrooms} Bedrooms</span></div>
                            <div className="flex items-center gap-2"><Bath className="w-5 h-5 text-primary"/> <span>{property.bathrooms} Bathrooms</span></div>
                            <div className="flex items-center gap-2"><SquareGanttChart className="w-5 h-5 text-primary"/> <span>{property.area.toLocaleString()} sqft</span></div>
                            <div className="flex items-center gap-2"><Building className="w-5 h-5 text-primary"/> <span className='capitalize'>{property.type}</span></div>
                            <div className="flex items-center gap-2"><Home className="w-5 h-5 text-primary"/> <span className='capitalize'>{property.category}</span></div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
                            <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 "/> <span>Posted {formatDistanceToNow(new Date(property.postedOn), { addSuffix: true })}</span></div>
                            <div className="flex items-center gap-2"><Eye className="w-5 h-5 "/> <span>{property.views.toLocaleString()} views</span></div>
                            <div className="flex items-center gap-2"><Heart className="w-5 h-5 "/> <span>{property.saves.toLocaleString()} saves</span></div>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="prose prose-lg max-w-none text-foreground/90">
                        <h3 className='font-headline text-2xl mb-4'>Property Description</h3>
                        <p>{property.description}</p>
                    </div>

                     {/* Amenities Card */}
                     {propertyAmenities.length > 0 && (
                        <>
                            <Separator />
                             <div>
                                <h3 className='font-headline text-2xl mb-4'>What this place offers</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                                    {propertyAmenities.map(amenity => (
                                    <div key={amenity.name} className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                                            <amenity.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{amenity.name}</span>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </>
                     )}
                     
                    {property.priceHistory.length > 0 && (
                        <>
                            <Separator />
                            <Accordion type="single" collapsible>
                                <AccordionItem value="price-history">
                                    <AccordionTrigger className='text-2xl font-headline flex items-center gap-3 hover:no-underline'>
                                        <History /> Price History
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <PriceHistoryChart data={property.priceHistory} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </>
                    )}


                    {property.vrTourUrl && (
                        <>
                            <Separator />
                             <div>
                                <h3 className='font-headline text-2xl mb-4 flex items-center gap-3'><Eye/> 360° Virtual Tour</h3>
                                <div className="aspect-video w-full rounded-lg overflow-hidden border mt-4">
                                    <iframe
                                        className="w-full h-full"
                                        src={property.vrTourUrl}
                                        title="360 Virtual Tour"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* Media Grid */}
                    {(property.floorPlanUrl || property.videoUrl) && (
                        <>
                            <Separator />
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                {property.floorPlanUrl && (
                                    <div>
                                        <h3 className="font-headline text-2xl mb-4">Floor Plan</h3>
                                        <Image
                                            src={property.floorPlanUrl}
                                            alt="Floor Plan"
                                            width={800}
                                            height={600}
                                            className="rounded-md w-full border mt-4"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                {property.videoUrl && (
                                    <div>
                                        <h3 className="font-headline text-2xl mb-4">Video Tour</h3>
                                        <div className="aspect-video mt-4">
                                            <iframe className="w-full h-full rounded-md border" src={property.videoUrl} title="Property Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h3 className='font-headline text-2xl mb-4'>What's Nearby?</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                {property.nearbyPlaces.map(place => (
                                    <div key={place.name} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                        {placeIcons[place.type] || <MapPin className="w-5 h-5 text-primary" />}
                                        <div>
                                            <p className="font-semibold">{place.name}</p>
                                            <p className="text-sm text-muted-foreground">{place.distance} away</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Map */}
                    <Separator />
                    <div>
                        <h3 className="font-headline text-2xl mb-4">Location</h3>
                         <div className={cn("h-96 rounded-lg overflow-hidden border mt-4")}>
                            <PropertyMap properties={[property]} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-8">
                        {/* Price Card - Show lock overlay if no price */}
                        <Card className="shadow-lg rounded-xl border-2">
                            <CardHeader>
                                {hasPrice ? (
                                    <CardTitle className='font-headline text-3xl'>{formatPrice(property.price)}</CardTitle>
                                ) : (
                                    <div className="flex items-center gap-3 text-muted-foreground/70">
                                        <Lock className="w-6 h-6" />
                                        <CardTitle className='font-headline text-2xl'>Sign in to view price</CardTitle>
                                    </div>
                                )}
                                <Badge variant="outline" className={cn('capitalize text-base w-fit', property.status === 'available' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300')}>{property.status}</Badge>
                            </CardHeader>
                            <CardContent>
                                {broker && (
                                  isAuthenticated ? (
                                    <AskQuestionForm />
                                  ) : (
                                    <PublicRestrictionOverlay message="Sign in to contact the agent about this property">
                                      <div className="space-y-4">
                                        <div className="h-10 bg-muted rounded" />
                                        <div className="h-10 bg-muted rounded" />
                                        <div className="h-24 bg-muted rounded" />
                                        <div className="h-10 bg-muted rounded" />
                                      </div>
                                    </PublicRestrictionOverlay>
                                  )
                                )}
                            </CardContent>
                        </Card>
                        
                        <EnvironmentalInfo info={property.environmentalInfo} />

                        {property.type === 'sale' && (
                          isAuthenticated && hasPrice ? (
                            <MortgageCalculator propertyPrice={property.price} />
                          ) : (
                            <PublicRestrictionOverlay message="Sign in to calculate your mortgage">
                              <div className="h-48 bg-muted rounded-lg" />
                            </PublicRestrictionOverlay>
                          )
                        )}

                        {/* Broker/Agent Card */}
                        {broker && (
                            isAuthenticated ? (
                              <Card className="text-center">
                                  <CardContent className="p-6">
                                      <p className="text-sm text-muted-foreground mb-4">Listed by</p>
                                      <Avatar className="w-16 h-16 mx-auto mb-2">
                                          <AvatarImage src={broker.avatar || ''} alt={broker.name} />
                                          <AvatarFallback>{broker.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                      </Avatar>
                                      <p className="font-semibold">{broker.name}</p>
                                      <p className="text-xs text-muted-foreground">Listing Agent</p>
                                      {hasContactInfo && (
                                        <div className='flex gap-2 mt-4'>
                                            {broker.phone && (
                                              <Button className="w-full" asChild size="sm">
                                                  <a href={`tel:${broker.phone}`}><Phone className='mr-2' />Call</a>
                                              </Button>
                                            )}
                                            {broker.email && (
                                              <Button className="w-full" variant="secondary" asChild size="sm">
                                                  <a href={`mailto:${broker.email}`}><Mail className='mr-2' />Email</a>
                                              </Button>
                                            )}
                                        </div>
                                      )}
                                      <Button className="w-full mt-2" variant="outline" asChild size="sm">
                                          <Link href={`/broker/${broker.id}`}>View Profile</Link>
                                      </Button>
                                  </CardContent>
                              </Card>
                            ) : (
                              <Card className="text-center">
                                <CardContent className="p-6">
                                  <p className="text-sm text-muted-foreground mb-4">Listed by</p>
                                  <Avatar className="w-16 h-16 mx-auto mb-2">
                                      <AvatarImage src={broker.avatar || ''} alt={broker.name} />
                                      <AvatarFallback>{broker.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <p className="font-semibold">{broker.name}</p>
                                  <p className="text-xs text-muted-foreground">Listing Agent</p>
                                  <div className="mt-4">
                                    <PublicRestrictionOverlay message="Sign in to contact this agent">
                                      <div className="flex gap-2">
                                        <div className="h-9 w-full bg-muted rounded-md" />
                                        <div className="h-9 w-full bg-muted rounded-md" />
                                      </div>
                                    </PublicRestrictionOverlay>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}