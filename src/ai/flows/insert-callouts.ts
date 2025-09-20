'use server';

/**
 * @fileOverview Flow to inject relevant and interesting examples and real-world scenarios into a podcast script.
 *
 * - insertCallouts - A function that injects callouts into a script.
 * - InsertCalloutsInput - The input type for the insertCallouts function.
 * - InsertCalloutsOutput - The return type for the insertCallouts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InsertCalloutsInputSchema = z.object({
  script: z.string().describe('The podcast script to inject callouts into.'),
  topic: z.string().describe('The topic of the podcast script.'),
});
export type InsertCalloutsInput = z.infer<typeof InsertCalloutsInputSchema>;

const InsertCalloutsOutputSchema = z.object({
  scriptWithCallouts: z.string().describe('The podcast script with injected callouts.'),
});
export type InsertCalloutsOutput = z.infer<typeof InsertCalloutsOutputSchema>;

export async function insertCallouts(input: InsertCalloutsInput): Promise<InsertCalloutsOutput> {
  return insertCalloutsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'insertCalloutsPrompt',
  input: {schema: InsertCalloutsInputSchema},
  output: {schema: InsertCalloutsOutputSchema},
  prompt: `You are an AI assistant that injects interesting examples and real-world scenarios into a podcast script.

  Here is the script:\n\n  {{script}}\n
  The topic of the script is: {{topic}}.

  Please inject relevant and interesting callouts, examples, and real-world scenarios into the script. Make sure callouts are clearly separated from the main text with horizontal lines. Each callout should start with the word 'Callout:'. The script must remain conversational and easy to follow.
  \n  Return the script with callouts.
  `,
});

const insertCalloutsFlow = ai.defineFlow(
  {
    name: 'insertCalloutsFlow',
    inputSchema: InsertCalloutsInputSchema,
    outputSchema: InsertCalloutsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
