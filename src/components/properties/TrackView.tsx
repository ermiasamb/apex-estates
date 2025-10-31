'use client';

import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import { useEffect } from 'react';

interface TrackViewProps {
  propertyId: string;
}

export function TrackView({ propertyId }: TrackViewProps) {
  const { addView } = useBrowsingHistory();

  useEffect(() => {
    addView(propertyId);
  }, [addView, propertyId]);

  return null;
}
