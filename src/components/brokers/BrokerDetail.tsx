'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProperties, mapApiProperty } from '@/services/property-service';
import type { Agent } from '@/services/user-service';
import { useAuth } from '@/providers/auth-provider';
import { PublicRestrictionOverlay } from '@/components/properties/PublicRestrictionOverlay';

export function BrokerDetail({ broker }: { broker: Agent }) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [brokerProperties, setBrokerProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrokerProperties() {
      try {
        const response = await fetchProperties({ limit: 100 });
        if (response && response.items) {
          const mapped = response.items.map(mapApiProperty);
          // Filter properties belonging to this broker (agent)
          const filtered = mapped.filter((p: any) => p.brokerId === broker.id);
          setBrokerProperties(filtered);
        }
      } catch (error) {
        console.error("Failed to load broker properties:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBrokerProperties();
  }, [broker.id]);

  return (
    <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-12">
            <Card className="max-w-4xl mx-auto">
                <CardContent className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary/10">
                            <AvatarImage src={broker.avatarUrl} alt={broker.name} />
                            <AvatarFallback>{broker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-headline font-bold">{broker.name}</h1>
                            <p className="text-lg text-primary font-semibold mt-1">Listing Agent</p>
                            <Separator className="my-4" />
                            {isAuthenticated ? (
                              <>
                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {broker.phone}</div>
                                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {broker.email}</div>
                                </div>
                                <div className="mt-6 flex gap-2 justify-center md:justify-start">
                                    <Button asChild><a href={`tel:${broker.phone}`}>Call Agent</a></Button>
                                    <Button variant="secondary" asChild><a href={`mailto:${broker.email}`}>Email Agent</a></Button>
                                </div>
                              </>
                            ) : (
                              <PublicRestrictionOverlay message="Sign in to contact this agent">
                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {broker.phone ? '*'.repeat(broker.phone.length) : '---'}</div>
                                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {'*'.repeat(broker.email.length)}</div>
                                </div>
                              </PublicRestrictionOverlay>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-5xl mx-auto mt-12">
                <h2 className="text-3xl font-headline font-semibold text-center mb-8">{broker.name}'s Listings ({brokerProperties.length})</h2>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-[300px] rounded-xl" />
                        ))}
                    </div>
                ) : brokerProperties.length > 0 ? (
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