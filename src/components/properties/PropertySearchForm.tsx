'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Separator } from '../ui/separator';

export function PropertySearchForm() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const location = formData.get('location') as string;
    const type = formData.get('type') as string;

    const query = new URLSearchParams({
      ...(location && { q: location }),
      ...(type && type !== 'all' && { type }),
    }).toString();

    router.push(`/search?${query}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-full flex-1">
          <Input
            id="location"
            name="location"
            type="search"
            placeholder="Search by city, neighborhood, or address"
            className="md:border-none md:focus-visible:ring-0 md:focus-visible:ring-offset-0 text-foreground h-12 text-base"
          />
        </div>
        <Separator orientation='vertical' className='h-8 hidden md:block' />
        <div className='w-full md:w-auto'>
           <Select name="type" defaultValue="all">
            <SelectTrigger className="w-full text-foreground md:border-none md:focus:ring-0 h-12">
                <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">For Sale or Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
            </Select>
        </div>
        <Button type="submit" className="w-full md:w-auto md:rounded-full h-12 px-8" size="lg">
          <Search className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Search</span>
        </Button>
      </div>
    </form>
  );
}
