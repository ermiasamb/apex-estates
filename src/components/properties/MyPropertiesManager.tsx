'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Eye, MoreHorizontal, Plus, Rocket, Trash2, Upload, XCircle } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { deleteProperty, fetchMyProperties, mapApiProperty, promoteProperty, updatePropertyStatus } from '@/services/property-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-300',
  FEATURED: 'bg-blue-100 text-blue-800 border-blue-300',
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  SOLD: 'bg-zinc-100 text-zinc-800 border-zinc-300',
  RENTED: 'bg-zinc-100 text-zinc-800 border-zinc-300',
  ARCHIVED: 'bg-red-100 text-red-800 border-red-300',
};

export function MyPropertiesManager() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const visibleProperties = useMemo(
    () => properties.filter((property) => property.rawStatus !== 'ARCHIVED'),
    [properties]
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadProperties() {
      setLoading(true);
      const response = await fetchMyProperties();
      setProperties((response.items || []).map(mapApiProperty));
      setLoading(false);
    }

    loadProperties();
  }, [user]);

  async function runAction(propertyId: string, action: () => Promise<unknown>, successMessage: string) {
    setBusyId(propertyId);
    try {
      await action();
      const response = await fetchMyProperties();
      setProperties((response.items || []).map(mapApiProperty));
      toast({ title: successMessage });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: error.message || 'Please try again.',
      });
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-headline font-bold">My Properties</h1>
          <p className="text-muted-foreground mt-1">{visibleProperties.length} listings posted by your account</p>
        </div>
        <Button asChild>
          <Link href="/add-listing"><Plus className="mr-2 h-4 w-4" />New Listing</Link>
        </Button>
      </div>

      {visibleProperties.length === 0 ? (
        <div className="border rounded-lg py-16 text-center">
          <h2 className="text-xl font-semibold">No properties posted yet</h2>
          <p className="text-muted-foreground mt-2">Create your first listing to manage it here.</p>
          <Button asChild className="mt-6">
            <Link href="/add-listing">Create Listing</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div>
                      <Link href={`/property/${property.id}`} className="font-medium hover:underline">
                        {property.title}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate max-w-[420px]">{property.address}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', statusStyles[property.rawStatus] || '')}>
                      {(property.rawStatus || property.status).replaceAll('_', ' ').toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${property.price.toLocaleString()}</TableCell>
                  <TableCell>{new Date(property.postedOn).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={busyId === property.id}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/property/${property.id}`}><Eye className="mr-2 h-4 w-4" />View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/property/${property.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => runAction(property.id, () => updatePropertyStatus(property.id, 'ACTIVE'), 'Property published')}>
                          <Upload className="mr-2 h-4 w-4" />Publish
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => runAction(property.id, () => updatePropertyStatus(property.id, 'DRAFT'), 'Property unpublished')}>
                          <XCircle className="mr-2 h-4 w-4" />Unpublish
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => runAction(property.id, () => promoteProperty(property.id), 'Property promoted for 30 days')}>
                          <Rocket className="mr-2 h-4 w-4" />Promote
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(property)}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This archives “{deleteTarget?.title}” and removes it from your active listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && runAction(deleteTarget.id, () => deleteProperty(deleteTarget.id), 'Property deleted')}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
