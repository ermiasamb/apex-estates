import data from './placeholder-images.json';

export type ImageCategory = 'exterior' | 'interior' | 'living-room' | 'kitchen' | 'bedroom' | 'bathroom' | 'plan';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  category: ImageCategory;
};

export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;
