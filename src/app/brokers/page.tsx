import { brokers } from '@/lib/data';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

export default function BrokersPage() {
  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold">Meet Our Expert Agents</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Dedicated professionals ready to guide you through every step of your real estate journey.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {brokers.map(broker => {
            const avatar = placeholderImages.find(p => p.id === broker.avatarId);
            return (
              <Card key={broker.id} className="text-center overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-8">
                  <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-muted">
                    {avatar && <AvatarImage src={avatar.imageUrl} alt={broker.name} data-ai-hint={avatar.imageHint} />}
                    <AvatarFallback>{broker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-headline font-semibold">{broker.name}</h2>
                  <p className="text-primary mt-1 font-medium">Listing Agent</p>
                  <div className="text-sm text-muted-foreground mt-4 space-y-2">
                      <div className="flex items-center justify-center gap-2"><Phone className="w-4 h-4" /><span>{broker.phone}</span></div>
                      <div className="flex items-center justify-center gap-2"><Mail className="w-4 h-4" /><span>{broker.email}</span></div>
                  </div>
                  <Button asChild className="mt-6 w-full">
                    <Link href={`/broker/${broker.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
