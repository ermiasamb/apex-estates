'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { amenities as allAmenities, brokers } from '@/lib/data';
import { Trash2, PlusCircle, UploadCloud, Image as ImageIcon } from 'lucide-react';
import type { NearbyPlaceType, PropertyCategory } from '@/lib/types';
import { LocationPicker } from './LocationPicker';
import { ImageDropzone } from './ImageDropzone';
import { useState } from 'react';
import Image from 'next/image';
import { ImageCategory } from '@/lib/placeholder-images';
import { createProperty } from '@/services/property-service';

const nearbyPlaceTypes = ['hospital', 'school', 'restaurant', 'church', 'playground', 'transport', 'gym', 'spa', 'mall'] as const;
const propertyCategories = ['apartment', 'condominium', 'villa', 'house', 'townhouse', 'land'] as const;
const imageCategories = ['exterior', 'interior', 'living-room', 'kitchen', 'bedroom', 'bathroom', 'plan'] as const;

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  type: z.enum(['sale', 'rent'], { required_error: 'You need to select a listing type.' }),
  category: z.enum(propertyCategories, { required_error: 'You need to select a property category.' }),
  status: z.enum(['available', 'sold', 'rented'], { required_error: 'You need to select a status.' }),
  price: z.coerce.number({ invalid_type_error: "Price must be a number" }).positive({ message: 'Price must be a positive number.' }),
  
  location: z.string().min(2, { message: 'Location is required.' }),
  address: z.string().min(5, { message: 'Please select a location on the map.' }),
  coordinates: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }),

  bedrooms: z.coerce.number().int().min(0, { message: 'Bedrooms cannot be negative.' }),
  bathrooms: z.coerce.number().int().min(0, { message: 'Bathrooms cannot be negative.' }),
  area: z.coerce.number().positive({ message: 'Area must be a positive number.' }),

  amenities: z.array(z.string()).optional(),
  
  brokerId: z.string({ required_error: 'Please select a broker.' }),
  
  environmentalInfo: z.object({
    walkScore: z.coerce.number().min(0).max(100),
    bikeScore: z.coerce.number().min(0).max(100),
    roadSafety: z.coerce.number().min(0).max(100),
    floodRisk: z.coerce.number().min(0).max(100),
    noiseLevel: z.coerce.number().min(0).max(100),
  }),

  nearbyPlaces: z.array(z.object({
      name: z.string().min(1, { message: "Place name is required."}),
      type: z.enum(nearbyPlaceTypes),
      distance: z.string().min(1, { message: "Distance is required."}),
  })).optional(),
  
  images: z.array(z.object({
      file: z.any(),
      category: z.enum(imageCategories)
  })).min(1, "Please upload at least one image."),

  floorPlan: z.any().optional(),

  videoType: z.enum(['url', 'upload']).default('url'),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  videoFile: z.any().optional(),

  vrTourUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
    if (data.videoType === 'upload' && !data.videoFile) {
        // This is optional for now
    }
    if (data.videoType === 'url' && (data.videoUrl && data.videoUrl.length > 0 && !z.string().url().safeParse(data.videoUrl).success)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['videoUrl'],
            message: 'Please enter a valid video URL.',
        });
    }
});


export function AddListingForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      location: 'Addis Ababa, Ethiopia',
      address: '',
      coordinates: { lat: 9.021808, lng: 38.800203 },
      bedrooms: 1,
      bathrooms: 1,
      area: 100,
      amenities: [],
      images: [],
      environmentalInfo: {
        walkScore: 50,
        bikeScore: 50,
        roadSafety: 50,
        floodRisk: 50,
        noiseLevel: 50,
      },
      nearbyPlaces: [],
      videoUrl: '',
      vrTourUrl: '',
    },
  });

  const { fields: nearbyFields, append: appendNearby, remove: removeNearby } = useFieldArray({
    control: form.control,
    name: "nearbyPlaces"
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
      control: form.control,
      name: "images"
  });
  
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null);
  const [videoFilePreview, setVideoFilePreview] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createProperty(values);
      toast({
        title: 'Property Submitted!',
        description: `"${values.title}" has been successfully submitted for review.`,
      });
      form.reset();
      // Clear previews
      setFloorPlanPreview(null);
      setVideoFilePreview(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'There was a problem with your submission.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Start with the most important details about your property.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Modern Villa with Ocean View" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe your property in detail..." rows={5} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Listing Type</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="sale" /></FormControl><FormLabel className="font-normal">For Sale</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="rent" /></FormControl><FormLabel className="font-normal">For Rent</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Property Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select property category" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {propertyCategories.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 4500000" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select property status" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="available">Available</SelectItem><SelectItem value="sold">Sold</SelectItem><SelectItem value="rented">Rented</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
             </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Click on the map to set your property's location. The address will be auto-filled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-96 rounded-lg overflow-hidden border">
                    <LocationPicker
                        initialPosition={form.getValues('coordinates')}
                        onLocationChange={({ lat, lng, address, cityState }) => {
                            form.setValue('coordinates', { lat, lng });
                            form.setValue('address', address);
                            form.setValue('location', cityState);
                        }}
                    />
                </div>
                 <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Address (auto-filled)</FormLabel>
                        <FormControl><Input readOnly {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>City, State (auto-filled)</FormLabel>
                        <FormControl><Input readOnly {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle><CardDescription>Specify the size and layout.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bedrooms" render={({ field }) => ( <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bathrooms" render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="area" render={({ field }) => ( <FormItem><FormLabel>Area (sqft)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Media</CardTitle><CardDescription>Upload images and videos for your property.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <FormLabel>Property Images</FormLabel>
                    <FormControl>
                        <ImageDropzone onDrop={(acceptedFiles) => {
                             acceptedFiles.forEach(file => {
                                const newImage = { file, category: 'exterior' as ImageCategory, preview: URL.createObjectURL(file) };
                                appendImage(newImage);
                            });
                        }} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.images?.message}</FormMessage>
                </div>

                <div className="space-y-4">
                    {imageFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-4 p-2 border rounded-lg">
                           <div className="w-24 h-24 relative flex-shrink-0 bg-muted rounded-md overflow-hidden">
                                {field.file ? 
                                    <Image src={URL.createObjectURL(field.file)} alt="preview" fill objectFit="cover" /> 
                                    : <ImageIcon className="w-8 h-8 text-muted-foreground m-auto" />
                                }
                            </div>
                            <div className="flex-grow space-y-2">
                                <p className="text-sm font-medium truncate">{field.file?.name}</p>
                                <FormField control={form.control} name={`images.${index}.category`} render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select image category" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {imageCategories.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat.replace('-', ' ')}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>

                <Separator/>

                <div>
                    <FormLabel>Floor Plan</FormLabel>
                    <ImageDropzone 
                        onDrop={(acceptedFiles) => {
                            const file = acceptedFiles[0];
                            if(file) {
                                form.setValue('floorPlan', file);
                                setFloorPlanPreview(URL.createObjectURL(file));
                            }
                        }}
                        dropzoneOptions={{multiple: false, accept: {'image/*': ['.png', '.gif', '.jpeg', '.jpg']}}} 
                        />
                     {floorPlanPreview && <div className="mt-4 w-32 h-32 relative"><Image src={floorPlanPreview} alt="floor plan preview" fill objectFit="contain" /></div>}
                </div>

                <Separator/>

                <FormField control={form.control} name="videoType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Video Tour</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 pt-2">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="url" /></FormControl><FormLabel className="font-normal">External URL</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="upload" /></FormControl><FormLabel className="font-normal">Upload File</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )} />

                {form.watch('videoType') === 'url' ? (
                     <FormField control={form.control} name="videoUrl" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Video Tour URL</FormLabel>
                            <FormControl><Input placeholder="https://www.youtube.com/embed/..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                ) : (
                    <div>
                        <FormLabel>Upload Video File</FormLabel>
                        <ImageDropzone 
                            onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if(file) {
                                    form.setValue('videoFile', file);
                                    setVideoFilePreview(URL.createObjectURL(file));
                                }
                            }} 
                            dropzoneOptions={{multiple: false, accept: {'video/*': ['.mp4', '.webm']}}} 
                        />
                        {videoFilePreview && <p className="text-sm text-muted-foreground mt-2">Selected: {form.getValues('videoFile')?.name}</p>}
                    </div>
                )}
               
                <Separator/>
                
                <FormField control={form.control} name="vrTourUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>360° Virtual Tour URL</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Amenities</CardTitle><CardDescription>Select all amenities that apply.</CardDescription></CardHeader>
          <CardContent>
            <FormField control={form.control} name="amenities" render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allAmenities.map((amenity) => (
                      <FormField key={amenity.name} control={form.control} name="amenities" render={({ field }) => (
                            <FormItem key={amenity.name} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl><Checkbox checked={field.value?.includes(amenity.name)} onCheckedChange={(checked) => {
                                    return checked ? field.onChange([...(field.value || []), amenity.name]) : field.onChange(field.value?.filter((value) => value !== amenity.name))
                                  }} /></FormControl>
                              <FormLabel className="font-normal flex items-center gap-2"><amenity.icon className="w-4 h-4 text-muted-foreground" />{amenity.name}</FormLabel>
                            </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Nearby Places</CardTitle><CardDescription>Add places of interest near the property.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {nearbyFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-4 border rounded-md relative">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                             <FormField control={form.control} name={`nearbyPlaces.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Place Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name={`nearbyPlaces.${index}.type`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>{nearbyPlaceTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name={`nearbyPlaces.${index}.distance`} render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeNearby(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendNearby({ name: "", type: "school", distance: "" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Nearby Place</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Agent & Area Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <FormField control={form.control} name="brokerId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Listing Agent</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a listing agent" /></SelectTrigger></FormControl>
                            <SelectContent>{brokers.map(broker => (<SelectItem key={broker.id} value={broker.id}>{broker.name}</SelectItem>))}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )} />
                <Separator/>
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Environmental / Area Scores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <FormField control={form.control} name="environmentalInfo.walkScore" render={({ field }) => (<FormItem><FormLabel>Walk Score</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="environmentalInfo.bikeScore" render={({ field }) => (<FormItem><FormLabel>Bike Score</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="environmentalInfo.roadSafety" render={({ field }) => ( <FormItem><FormLabel>Road Safety</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="environmentalInfo.floodRisk" render={({ field }) => (<FormItem><FormLabel>Flood Risk</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="environmentalInfo.noiseLevel" render={({ field }) => ( <FormItem><FormLabel>Noise Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Create Listing'}
        </Button>
      </form>
    </Form>
  );
}
