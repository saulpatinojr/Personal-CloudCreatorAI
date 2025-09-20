'use server';

/**
 * @fileOverview Generates catchy titles for content based on a topic.
 *
 * - generateCatchyTitles - A function that generates catchy titles.
 * - GenerateCatchyTitlesInput - The input type for the generateCatchyTitles function.
 * - GenerateCatchyTitlesOutput - The return type for the generateCatchyTitles function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCatchyTitlesInputSchema = z.object({
  topic: z.string().describe('The basic topic for the content.'),
});
export type GenerateCatchyTitlesInput = z.infer<
  typeof GenerateCatchyTitlesInputSchema
>;

const GenerateCatchyTitlesOutputSchema = z.object({
  titles: z
    .array(z.string())
    .describe(
      'A list of catchy, content-worthy titles for a podcast, optimized for LinkedIn engagement.'
    ),
});
export type GenerateCatchyTitlesOutput = z.infer<
  typeof GenerateCatchyTitlesOutputSchema
>;

export async function generateCatchyTitles(
  input: GenerateCatchyTitlesInput
): Promise<GenerateCatchyTitlesOutput> {
  return generateCatchyTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCatchyTitlesPrompt',
  input: { schema: GenerateCatchyTitlesInputSchema },
  output: { schema: GenerateCatchyTitlesOutputSchema },
  prompt: `You are an expert content strategist specializing in creating viral-worthy titles for a professional LinkedIn audience.

  Given the following topic, generate a list of 5 catchy, compelling, and click-worthy titles for a podcast. The titles should be crafted to maximize engagement and encourage listeners. They should be professional yet intriguing.

  Topic: {{{topic}}}
  `,
});

const generateCatchyTitlesFlow = ai.defineFlow(
  {
    name: 'generateCatchyTitlesFlow',
    inputSchema: GenerateCatchyTitlesInputSchema,
    outputSchema: GenerateCatchyTitlesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
