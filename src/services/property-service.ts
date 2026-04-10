'use server';

import { apiClient } from '@/lib/api-client';

export async function createProperty(data: any): Promise<any> {
    console.log("Preparing to submit property data:", data);

    const payload = { ...data };
    
    // In a real-world application, you would handle file uploads separately.
    // Typically, you'd upload files to a cloud storage service (like S3 or Firebase Storage)
    // from the client-side to get a URL, and then send that URL to your backend.
    // Here, we simulate this by removing file objects and adding mock URLs.
    
    if (payload.images && Array.isArray(payload.images)) {
        payload.images = payload.images.map((img: any, index: number) => ({
            category: img.category,
            url: `https://cdn.apex-estates.com/properties/prop-id/image-${index}.jpg`, // Placeholder URL
        }));
    } else {
        payload.images = [];
    }

    if (payload.floorPlan) {
        payload.floorPlanUrl = `https://cdn.apex-estates.com/properties/prop-id/floor-plan.jpg`;
    }
    delete payload.floorPlan;

     if (payload.videoFile) {
        payload.videoUrl = `https://cdn.apex-estates.com/properties/prop-id/video.mp4`;
    }
    delete payload.videoFile;


    // The API client will throw an error on failure, which will be caught in the form.
    // Note: The endpoint 'https://app.apex.com/create-property' is a placeholder
    // and will not actually work. This demonstrates the structure of the API call.
    try {
        // This will likely fail because the endpoint is not real.
        // To test the success case, you can replace this block with a mock success response:
        // return Promise.resolve({ success: true, propertyId: 'new-prop-123' });
        const response = await apiClient.post('/create-property', payload);
        return response;
    } catch (error) {
        console.error("API call to /create-property failed. This is expected as the endpoint is a placeholder.", error);
        // Re-throwing a more user-friendly error message.
        throw new Error('Failed to connect to the server. Please try again later.');
    }
}
