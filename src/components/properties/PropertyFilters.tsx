'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { NearbyPlaceType } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';

type FilterState = {
    query: string;
    type: 'sale' | 'rent' | 'all' | null;
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
    
    const handleSelectChange = (name: keyof FilterState) => (value: string) => {
        setFilters(prev => ({...prev, [name]: value === 'all' ? null : value }));
    };

    const handleSliderChange = (values: number[]) => {
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

    const bedOptions = ['any', '1', '2', '3', '4+'];
    const bathOptions = ['any', '1', '2', '3+'];

    return (
        <Card className="sticky top-24 shadow-md rounded-xl">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Filter Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="search">Search Location or Keyword</Label>
                    <Input id="search" placeholder="e.g. 'Malibu' or 'Ocean View'" value={filters.query} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={filters.type || 'all'} onValueChange={handleSelectChange('type')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Any Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Type</SelectItem>
                            <SelectItem value="sale">For Sale</SelectItem>
                            <SelectItem value="rent">For Rent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Price Range</Label>
                     <div className="flex justify-between text-sm font-medium">
                        <span>{formatPrice(filters.minPrice)}</span>
                        <span>{formatPrice(filters.maxPrice)}</span>
                    </div>
                    <Slider 
                        defaultValue={[0, 10000000]} 
                        max={10000000} 
                        step={50000} 
                        onValueChange={handleSliderChange}
                    />
                </div>

                <div className="space-y-3">
                    <Label>Bedrooms</Label>
                     <div className="flex flex-wrap gap-2">
                         {bedOptions.map(val => (
                             <Button key={val} size="sm" variant={filters.bedrooms === val ? 'default': 'outline'} onClick={() => setFilters(prev => ({...prev, bedrooms: val}))} className="flex-1 rounded-full">{val === 'any' ? 'Any' : `${val}`}</Button>
                         ))}
                     </div>
                </div>

                <div className="space-y-3">
                    <Label>Bathrooms</Label>
                     <div className="flex flex-wrap gap-2">
                         {bathOptions.map(val => (
                             <Button key={val} size="sm" variant={filters.bathrooms === val ? 'default': 'outline'} onClick={() => setFilters(prev => ({...prev, bathrooms: val}))} className="flex-1 rounded-full">{val === 'any' ? 'Any' : `${val}`}</Button>
                         ))}
                     </div>
                </div>

                <div className="space-y-3">
                    <Label>Nearby Places</Label>
                     <div className="grid grid-cols-2 gap-2">
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

            </CardContent>
        </Card>
    );
}
