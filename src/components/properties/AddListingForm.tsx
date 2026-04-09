'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { amenities as allAmenities, brokers } from '@/lib/data';
import { Trash2, PlusCircle } from 'lucide-react';
import type { NearbyPlaceType } from '@/lib/types';

const nearbyPlaceTypes: NearbyPlaceType[] = ['hospital', 'school', 'restaurant', 'church', 'playground', 'transport', 'gym', 'spa', 'mall'];

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  type: z.enum(['sale', 'rent'], { required_error: 'You need to select a property type.' }),
  status: z.enum(['available', 'sold', 'rented'], { required_error: 'You need to select a status.' }),
  price: z.coerce.number({ invalid_type_error: "Price must be a number" }).positive({ message: 'Price must be a positive number.' }),
  
  location: z.string().min(2, { message: 'Location is required.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
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
  
  // For simplicity, we'll take URLs for now. A real app would have file uploads.
  imageIds: z.string().optional().describe('Comma-separated image IDs'),
  floorPlanId: z.string().optional(),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  vrTourUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export function AddListingForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      location: '',
      address: '',
      coordinates: { lat: 0, lng: 0 },
      bedrooms: 1,
      bathrooms: 1,
      area: 1000,
      amenities: [],
      environmentalInfo: {
        walkScore: 50,
        bikeScore: 50,
        roadSafety: 50,
        floodRisk: 50,
        noiseLevel: 50,
      },
      nearbyPlaces: [],
      imageIds: '',
      floorPlanId: '',
      videoUrl: '',
      vrTourUrl: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "nearbyPlaces"
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, you would transform `imageIds` string to an array
    // and then send the data to your backend API.
    toast({
      title: 'Property Listed!',
      description: `"${values.title}" has been successfully added.`,
    });
    form.reset();
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Modern Villa with Ocean View" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your property in detail..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Listing Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="sale" />
                            </FormControl>
                            <FormLabel className="font-normal">For Sale</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="rent" />
                            </FormControl>
                            <FormLabel className="font-normal">For Rent</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select property status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             </div>
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 4500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Provide the address and coordinates for the property.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl><Input placeholder="e.g., 25800 Pacific Coast Hwy, Malibu, CA 90265" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>City, State</FormLabel>
                        <FormControl><Input placeholder="e.g., Malibu, CA" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="coordinates.lat" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl><Input type="number" step="any" placeholder="e.g., 34.038" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="coordinates.lng" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl><Input type="number" step="any" placeholder="e.g., -118.689" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Specify the size and layout of the property.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bedrooms" render={({ field }) => (
                <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="bathrooms" render={({ field }) => (
                <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem>
                    <FormLabel>Area (sqft)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Provide media URLs and IDs. For a real app, this would be a file upload section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="imageIds" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image IDs</FormLabel>
                        <FormControl><Input placeholder="e.g., property-1-ext, property-1-int-1" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="floorPlanId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Floor Plan ID</FormLabel>
                        <FormControl><Input placeholder="e.g., property-1-plan" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="videoUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Video Tour URL</FormLabel>
                        <FormControl><Input placeholder="https://www.youtube.com/embed/..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
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
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>Select all amenities that apply to the property.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allAmenities.map((amenity) => (
                      <FormField
                        key={amenity.name}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => {
                          return (
                            <FormItem key={amenity.name} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(amenity.name)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), amenity.name])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== amenity.name
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-2">
                                <amenity.icon className="w-4 h-4 text-muted-foreground" />
                                {amenity.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Nearby Places</CardTitle>
                <CardDescription>Add places of interest near the property.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-4 border rounded-md relative">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                             <FormField
                                control={form.control}
                                name={`nearbyPlaces.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Place Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={form.control}
                                name={`nearbyPlaces.${index}.type`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {nearbyPlaceTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`nearbyPlaces.${index}.distance`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Distance</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                         </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ name: "", type: "school", distance: "" })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Nearby Place
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Agent & Area Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="brokerId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Listing Agent</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a listing agent" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {brokers.map(broker => (
                                <SelectItem key={broker.id} value={broker.id}>{broker.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Separator/>
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Environmental / Area Scores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <FormField control={form.control} name="environmentalInfo.walkScore" render={({ field }) => (
                            <FormItem><FormLabel>Walk Score</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="environmentalInfo.bikeScore" render={({ field }) => (
                            <FormItem><FormLabel>Bike Score</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="environmentalInfo.roadSafety" render={({ field }) => (
                            <FormItem><FormLabel>Road Safety</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="environmentalInfo.floodRisk" render={({ field }) => (
                            <FormItem><FormLabel>Flood Risk</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="environmentalInfo.noiseLevel" render={({ field }) => (
                            <FormItem><FormLabel>Noise Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">Create Listing</Button>
      </form>
    </Form>
  );
}
