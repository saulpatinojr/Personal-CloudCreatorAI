'use server';

/**
 * @fileOverview Generates a podcast script from a given topic related to Azure Architecture, Azure Hybrid, or Azure Migrations.
 *
 * - generateScriptFromTopic - A function that generates the podcast script.
 * - GenerateScriptInput - The input type for the generateScriptFromTopic function.
 * - GenerateScriptOutput - The return type for the generateScriptFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScriptInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'The topic for the podcast script, related to Azure Architecture, Azure Hybrid, or Azure Migrations.'
    ),
});
export type GenerateScriptInput = z.infer<typeof GenerateScriptInputSchema>;

const GenerateScriptOutputSchema = z.object({
  script: z
    .string()
    .describe('The generated podcast script in teleprompter format.'),
});
export type GenerateScriptOutput = z.infer<typeof GenerateScriptOutputSchema>;

export async function generateScriptFromTopic(input: GenerateScriptInput): Promise<GenerateScriptOutput> {
  return generateScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScriptPrompt',
  input: {schema: GenerateScriptInputSchema},
  output: {schema: GenerateScriptOutputSchema},
  prompt: `You are a podcast script writer specializing in Azure Architecture, Azure Hybrid, and Azure Migrations.

  Given the following topic, generate a 20-minute teleprompter-style script suitable for a technical audience (level 200-300, with level 400 insights where appropriate). The script should be educational, informative, and delivered in a natural, friendly, and conversational tone. Include section headers, transitions, callouts, examples, and real-world scenarios.

  Topic: {{{topic}}}
  `,
});

const generateScriptFlow = ai.defineFlow(
  {
    name: 'generateScriptFlow',
    inputSchema: GenerateScriptInputSchema,
    outputSchema: GenerateScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
