import { MyPropertiesManager } from '@/components/properties/MyPropertiesManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Properties | Apex Estates',
  description: 'Manage your posted property listings.',
};

export default function MyPropertiesPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <MyPropertiesManager />
    </div>
  );
}
