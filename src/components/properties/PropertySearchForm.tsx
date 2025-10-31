'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export function PropertySearchForm() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const location = formData.get('location') as string;
    const type = formData.get('type') as string;
    const minPrice = formData.get('minPrice') as string;
    const maxPrice = formData.get('maxPrice') as string;

    const query = new URLSearchParams({
      ...(location && { q: location }),
      ...(type && type !== 'all' && { type }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
    }).toString();

    router.push(`/search?${query}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col md:flex-row gap-2 md:bg-white/10 md:p-2 md:rounded-lg md:border border-white/20">
        <Input
          name="location"
          type="search"
          placeholder="Enter a location, neighborhood, or address"
          className="md:bg-transparent md:border-none md:focus-visible:ring-0 md:focus-visible:ring-offset-0 text-foreground md:text-white md:placeholder:text-neutral-300"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select name="type" defaultValue="all">
            <SelectTrigger className="w-full text-foreground md:text-white md:bg-white/10 md:border-white/20">
                <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">For Sale or Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
            </Select>
            <Select name="minPrice">
            <SelectTrigger className="w-full text-foreground md:text-white md:bg-white/10 md:border-white/20">
                <SelectValue placeholder="Min Price" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="0">$0</SelectItem>
                <SelectItem value="250000">$250,000</SelectItem>
                <SelectItem value="500000">$500,000</SelectItem>
                <SelectItem value="750000">$750,000</SelectItem>
                <SelectItem value="1000000">$1,000,000</SelectItem>
            </SelectContent>
            </Select>
            <Select name="maxPrice">
            <SelectTrigger className="w-full text-foreground md:text-white md:bg-white/10 md:border-white/20">
                <SelectValue placeholder="Max Price" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="500000">$500,000</SelectItem>
                <SelectItem value="750000">$750,000</SelectItem>
                <SelectItem value="1000000">$1,000,000</SelectItem>
                <SelectItem value="2000000">$2,000,000</SelectItem>
                <SelectItem value="any">Any Price</SelectItem>
            </SelectContent>
            </Select>
        </div>
        <Button type="submit" className="w-full md:w-auto" size="lg">
          <Search className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Search</span>
        </Button>
      </div>
    </form>
  );
}
