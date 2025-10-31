'use client';
import { PropertyDetail } from "@/components/properties/PropertyDetail";
import { properties } from "@/lib/data";
import { notFound } from "next/navigation";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === params.id);

  if (!property) {
    notFound();
  }
  
  return <PropertyDetail property={property} />;
}
