'use client';
import { brokers, properties } from '@/lib/data';
import { notFound } from 'next/navigation';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function BrokerDetail({ id }: { id: string }) {
  const broker = brokers.find((b) => b.id === id);
  if (!broker) {
    notFound();
  }

  const brokerProperties = properties.filter(p => p.brokerId === broker.id);
  const avatar = placeholderImages.find(p => p.id === broker.avatarId);

  return (
    <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-12">
            <Card className="max-w-4xl mx-auto">
                <CardContent className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {avatar && (
                            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary/10">
                                <AvatarImage src={avatar.imageUrl} alt={broker.name} data-ai-hint={avatar.imageHint} />
                                <AvatarFallback>{broker.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-headline font-bold">{broker.name}</h1>
                            <p className="text-lg text-primary font-semibold mt-1">Listing Agent</p>
                            <Separator className="my-4" />
                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-muted-foreground">
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {broker.phone}</div>
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {broker.email}</div>
                            </div>
                            <div className="mt-6 flex gap-2 justify-center md:justify-start">
                                <Button asChild><a href={`tel:${broker.phone}`}>Call Agent</a></Button>
                                <Button variant="secondary" asChild><a href={`mailto:${broker.email}`}>Email Agent</a></Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-5xl mx-auto mt-12">
                <h2 className="text-3xl font-headline font-semibold text-center mb-8">{broker.name}'s Listings ({brokerProperties.length})</h2>
                {brokerProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brokerProperties.map(prop => <PropertyCard key={prop.id} property={prop} />)}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">This agent has no active listings.</p>
                )}
            </div>
        </div>
    </div>
  );
}
