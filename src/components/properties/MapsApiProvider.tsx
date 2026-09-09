'use client';

import { useLoadScript } from '@react-google-maps/api';
import React, { createContext, useContext } from 'react';

const MapsApiContext = createContext<boolean>(false);

export const useMapsApi = () => useContext(MapsApiContext);

export function MapsApiProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geocoding'],
  });

  return (
    <MapsApiContext.Provider value={isLoaded}>
      {children}
    </MapsApiContext.Provider>
  );
}