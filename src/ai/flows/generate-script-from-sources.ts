'use server';

/**
 * @fileOverview Generates a podcast script from a topic and a list of sources.
 *
 * - generateScriptFromSources - A function that generates a podcast script, takeaways, and references.
 * - GenerateScriptFromSourcesInput - The input type for the function.
 * - GenerateScriptFromSourcesOutput - The return type for the function.
 * - Source - The type for a single source item.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SourceSchema = z.object({
  type: z.enum(['url', 'pdf', 'text']),
  name: z.string(),
  content: z.string(),
});
export type Source = z.infer<typeof SourceSchema>;

const GenerateScriptFromSourcesInputSchema = z.object({
  topic: z.string().describe('The selected title for the podcast episode.'),
  sources: z
    .array(SourceSchema)
    .describe('An array of sources (URLs, text snippets) for the content.'),
});
export type GenerateScriptFromSourcesInput = z.infer<
  typeof GenerateScriptFromSourcesInputSchema
>;

const GenerateScriptFromSourcesOutputSchema = z.object({
  script: z
    .string()
    .describe('The generated podcast script in teleprompter format.'),
  takeaways: z
    .array(z.string())
    .describe('A list of key takeaways from the script.'),
  references: z
    .array(z.string())
    .describe('A list of source URLs used as references.'),
});
export type GenerateScriptFromSourcesOutput = z.infer<
  typeof GenerateScriptFromSourcesOutputSchema
>;

export async function generateScriptFromSources(
  input: GenerateScriptFromSourcesInput
): Promise<GenerateScriptFromSourcesOutput> {
  return generateScriptFromSourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScriptFromSourcesPrompt',
  input: { schema: GenerateScriptFromSourcesInputSchema },
  output: { schema: GenerateScriptFromSourcesOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a podcast script writer specializing in creating engaging content for a technical audience on Azure topics.

  Topic: {{{topic}}}

  Sources:
  {{#each sources}}
  - [{{{type}}}] {{{name}}}: {{{content}}}
  {{/each}}

  Generate a podcast script (10-15 minutes), key takeaways (3-5 points), and references (URLs only).
  `,
});

export const generateScriptFromSourcesFlow = ai.defineFlow(
  {
    name: 'generateScriptFromSourcesFlow',
    inputSchema: GenerateScriptFromSourcesInputSchema,
    outputSchema: GenerateScriptFromSourcesOutputSchema,
  },
  async (input) => {
    // For PDF sources, the 'content' is just the filename.
    // We'll amend the input to clarify this for the model.
    const processedSources = input.sources.map(source => {
      if (source.type === 'pdf') {
        return { ...source, content: `Content from the PDF file named "${source.name}" should be used as a primary reference.` };
      }
      return source;
    });

    const { output } = await prompt({ ...input, sources: processedSources });
    return output!;
  }
);
