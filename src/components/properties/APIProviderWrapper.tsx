'use client';
import { APIProvider } from '@vis.gl/react-google-maps';

export function APIProviderWrapper({ children }: { children: React.ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("Google Maps API key is missing. Map features will be disabled. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.");
        return <>{children}</>;
    }

    return (
        <APIProvider apiKey={apiKey}>
            {children}
        </APIProvider>
    );
}
