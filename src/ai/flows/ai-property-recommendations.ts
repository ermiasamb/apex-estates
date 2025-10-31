'use server';
/**
 * @fileOverview An AI-powered property recommendation flow.
 *
 * - getAIPropertyRecommendations - A function that returns AI-driven property recommendations.
 * - AIPropertyRecommendationsInput - The input type for the getAIPropertyRecommendations function.
 * - AIPropertyRecommendationsOutput - The return type for the getAIPropertyRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPropertyRecommendationsInputSchema = z.object({
  browsingHistory: z.string().describe('The user browsing history, as a JSON array of property ids.'),
  savedPreferences: z.string().describe('The user saved preferences, as a JSON object.'),
});
export type AIPropertyRecommendationsInput = z.infer<
  typeof AIPropertyRecommendationsInputSchema
>;

const AIPropertyRecommendationsOutputSchema = z.object({
  propertyIds: z
    .string()
    .describe('A JSON array of property ids that are recommended for the user.'),
});
export type AIPropertyRecommendationsOutput = z.infer<
  typeof AIPropertyRecommendationsOutputSchema
>;

export async function getAIPropertyRecommendations(
  input: AIPropertyRecommendationsInput
): Promise<AIPropertyRecommendationsOutput> {
  return aiPropertyRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPropertyRecommendationsPrompt',
  input: {schema: AIPropertyRecommendationsInputSchema},
  output: {schema: AIPropertyRecommendationsOutputSchema},
  prompt: `You are an AI real estate expert. Given a user's browsing history and saved preferences, you will recommend properties that the user might be interested in.

Browsing History: {{{browsingHistory}}}
Saved Preferences: {{{savedPreferences}}}

Return a JSON array of property ids.`,
});

const aiPropertyRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiPropertyRecommendationsFlow',
    inputSchema: AIPropertyRecommendationsInputSchema,
    outputSchema: AIPropertyRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
