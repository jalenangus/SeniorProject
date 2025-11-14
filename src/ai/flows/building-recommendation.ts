'use server';

/**
 * @fileOverview Building Recommendation AI agent.
 *
 * - recommendBuilding - A function that handles the building recommendation process.
 * - RecommendBuildingInput - The input type for the recommendBuilding function.
 * - RecommendBuildingOutput - The return type for the recommendBuilding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendBuildingInputSchema = z.object({
  justification: z
    .string()
    .describe('The justification for the access request.'),
});
export type RecommendBuildingInput = z.infer<typeof RecommendBuildingInputSchema>;

const RecommendBuildingOutputSchema = z.object({
  buildingSuggestion: z.string().describe('The suggested building based on the justification.'),
});
export type RecommendBuildingOutput = z.infer<typeof RecommendBuildingOutputSchema>;

export async function recommendBuilding(input: RecommendBuildingInput): Promise<RecommendBuildingOutput> {
  return recommendBuildingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendBuildingPrompt',
  input: {schema: RecommendBuildingInputSchema},
  output: {schema: RecommendBuildingOutputSchema},
  prompt: `You are an AI assistant designed to suggest the most appropriate building at North Carolina A&T State University based on the justification provided for an after-hours access request. Consider the following buildings: McNair, Martin, Graham, Monroe. Only respond with one of the listed options. 

Justification: {{{justification}}}`,
});

const recommendBuildingFlow = ai.defineFlow(
  {
    name: 'recommendBuildingFlow',
    inputSchema: RecommendBuildingInputSchema,
    outputSchema: RecommendBuildingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
