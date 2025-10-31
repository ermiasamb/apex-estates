'use client';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  propertyId: string;
  className?: string;
}

export function FavoriteButton({ propertyId, className }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const isFavorite = favorites.includes(propertyId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(propertyId);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      duration: 2000,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        'rounded-full h-10 w-10 bg-white/70 backdrop-blur-sm hover:bg-white',
        className
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all duration-300',
          isFavorite ? 'text-red-500 fill-red-500' : 'text-primary/70'
        )}
      />
    </Button>
  );
}
