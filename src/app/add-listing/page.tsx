import { AddListingForm } from '@/components/properties/AddListingForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add New Property Listing | Apex Estates',
    description: 'Add a new property to our listings. Fill out the form to get started.',
};

export default function AddListingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold">List Your Property</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Fill in the details below to add your property to Apex Estates.
          </p>
        </div>
        <AddListingForm />
      </div>
    </div>
  );
}
