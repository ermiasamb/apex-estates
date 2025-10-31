'use server';
import { getAIPropertyRecommendations } from '@/ai/flows/ai-property-recommendations';

export async function getRecommendationsAction(
  browsingHistory: string,
  savedPreferences: string
) {
  try {
    const result = await getAIPropertyRecommendations({
      browsingHistory,
      savedPreferences,
    });
    return JSON.parse(result.propertyIds);
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    return [];
  }
}
