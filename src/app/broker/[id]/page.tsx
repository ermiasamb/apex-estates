'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrokerDetail } from "@/components/brokers/BrokerDetail";
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAgentById, fetchAgents } from '@/services/user-service';
import { useAuth } from '@/providers/auth-provider';
import type { Agent } from '@/services/user-service';

export default function BrokerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [broker, setBroker] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadBroker() {
      try {
        const result = await fetchAgentById(params.id as string);
        if (result) {
          setBroker(result);
        } else {
          // Fallback: try fetching all agents and finding by ID
          const agents = await fetchAgents();
          const found = agents.find(a => a.id === params.id);
          if (found) {
            setBroker(found);
          }
        }
      } catch (error) {
        console.error("Failed to load broker:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBroker();
  }, [params.id, user]);

  if (authLoading) {
    return (
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-12 max-w-4xl mx-auto">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-12 max-w-4xl mx-auto">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold">Agent not found</h1>
          <p className="text-muted-foreground mt-2">The requested agent profile could not be found.</p>
        </div>
      </div>
    );
  }

  return <BrokerDetail broker={broker} />;
}
