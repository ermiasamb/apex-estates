'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAgents } from '@/services/user-service';
import { useAuth } from '@/providers/auth-provider';
import type { Agent } from '@/services/user-service';

export default function BrokersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadAgents() {
      try {
        const result = await fetchAgents();
        setAgents(result);
      } catch (error) {
        console.error("Failed to load agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, [user]);

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="text-center overflow-hidden">
                <CardContent className="p-8">
                  <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-4" />
                  <Skeleton className="h-4 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto mb-6" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold">Meet Our Expert Agents</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Dedicated professionals ready to guide you through every step of your real estate journey.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="text-center overflow-hidden">
                <CardContent className="p-8">
                  <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-4" />
                  <Skeleton className="h-4 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto mb-6" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map(agent => (
              <Card key={agent.id} className="text-center overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-8">
                  <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-muted">
                    <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                    <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-headline font-semibold">{agent.name}</h2>
                  <p className="text-primary mt-1 font-medium">Listing Agent</p>
                  <div className="text-sm text-muted-foreground mt-4 space-y-2">
                      <div className="flex items-center justify-center gap-2"><Phone className="w-4 h-4" /><span>{agent.phone}</span></div>
                      <div className="flex items-center justify-center gap-2"><Mail className="w-4 h-4" /><span>{agent.email}</span></div>
                  </div>
                  <Button asChild className="mt-6 w-full">
                    <Link href={`/broker/${agent.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold">No agents found</h2>
            <p className="text-muted-foreground mt-2">Check back later for our agents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
