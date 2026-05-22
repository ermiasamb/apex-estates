'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { NearbyPlaceType } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { SlidersHorizontal } from 'lucide-react';
import { Separator } from '../ui/separator';

export type FilterState = {
    query: string;
    type: 'sale' | 'rent' | 'all';
    minPrice: number;
    maxPrice: number;
    bedrooms: string;
    bathrooms: string;
    nearby: string[];
};

interface PropertyFiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const nearbyOptions: { id: NearbyPlaceType, label: string }[] = [
    { id: 'school', label: 'School' },
    { id: 'hospital', label: 'Hospital' },
    { id: 'mall', label: 'Shopping Mall' },
    { id: 'transport', label: 'Transport' },
    { id: 'gym', label: 'Gym/Spa' },
    { id: 'playground', label: 'Playground' },
    { id: 'church', label: 'Church' },
];

export function PropertyFilters({ filters, setFilters }: PropertyFiltersProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({...prev, query: e.target.value}));
    };
    
    const handleSelectChange = (name: keyof Pick<FilterState, 'type' | 'bedrooms' | 'bathrooms'>) => (value: string) => {
        setFilters(prev => ({...prev, [name]: value }));
    };

    const handlePriceChange = (values: number[]) => {
        setFilters(prev => ({...prev, minPrice: values[0], maxPrice: values[1]}));
    };

    const handleNearbyChange = (nearbyId: string) => {
        setFilters(prev => {
            const newNearby = prev.nearby.includes(nearbyId)
                ? prev.nearby.filter(id => id !== nearbyId)
                : [...prev.nearby, nearbyId];
            return { ...prev, nearby: newNearby };
        });
    }

    const formatPrice = (value: number) => {
        if (value >= 10000000) return 'Any';
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${Math.round(value / 1000)}k`;
        return `$${value}`;
    }

    const bedOptions = ['any', '1', '2', '3', '4', '5+'];
    const bathOptions = ['any', '1', '2', '3', '4+'];

    const resetFilters = () => {
        setFilters({
            query: '',
            type: 'all',
            minPrice: 0,
            maxPrice: Infinity,
            bedrooms: 'any',
            bathrooms: 'any',
            nearby: [],
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className='flex-grow sm:flex-grow-0 sm:w-auto'>
                 <Input id="search" placeholder="Enter a location or keyword" value={filters.query} onChange={handleInputChange} className="h-10" />
            </div>
           
            <Select value={filters.type || 'all'} onValueChange={handleSelectChange('type')}>
                <SelectTrigger className='w-full sm:w-[120px]'>
                    <SelectValue placeholder="For Sale/Rent" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Buy or Rent</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Price</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-4">
                        <Label>Price Range</Label>
                        <div className="flex justify-between text-sm font-medium">
                            <span>{formatPrice(filters.minPrice)}</span>
                            <span>{formatPrice(filters.maxPrice === Infinity ? 10000000 : filters.maxPrice)}</span>
                        </div>
                        <Slider 
                            defaultValue={[0, 10000000]} 
                            max={10000000} 
                            step={50000} 
                            onValueChange={handlePriceChange}
                        />
                    </div>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Beds & Baths</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                     <div className="space-y-4">
                        <div>
                            <Label>Bedrooms</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {bedOptions.map(val => (
                                    <Button key={`bed-${val}`} size="sm" variant={filters.bedrooms === val ? 'default': 'outline'} onClick={() => setFilters(prev => ({...prev, bedrooms: val}))} className="flex-1 rounded-full">{val === 'any' ? 'Any' : `${val}`}</Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Bathrooms</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {bathOptions.map(val => (
                                    <Button key={`bath-${val}`} size="sm" variant={filters.bathrooms === val ? 'default': 'outline'} onClick={() => setFilters(prev => ({...prev, bathrooms: val}))} className="flex-1 rounded-full">{val === 'any' ? 'Any' : `${val}`}</Button>
                                ))}
                            </div>
                        </div>
                     </div>
                </PopoverContent>
            </Popover>
            
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                        <SlidersHorizontal className='w-4 h-4' /> More
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-4">
                         <div>
                            <Label>Nearby Places</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {nearbyOptions.map(option => (
                                    <div key={option.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`nearby-${option.id}`}
                                            checked={filters.nearby.includes(option.id)}
                                            onCheckedChange={() => handleNearbyChange(option.id)}
                                        />
                                        <label
                                            htmlFor={`nearby-${option.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Button variant="ghost" onClick={resetFilters}>Clear</Button>

        </div>
    );
}
