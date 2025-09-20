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
  prompt: `You are a podcast script writer specializing in creating engaging content for a technical audience (level 200-300) on Azure topics.

  Your task is to generate a complete podcast episode package based on the provided topic and sources.

  **Topic:**
  "{{{topic}}}"

  **Sources:**
  {{#each sources}}
  - [{{type}}] {{{name}}}: {{{content}}}
  {{/each}}

  Please generate the following:
  1.  **Podcast Script**: A teleprompter-style script that is at least 20 minutes in length. It should be educational, informative, and have a natural, conversational tone.
      - Include clear section headers (e.g., # Introduction, # Main Point, # Conclusion).
      - Inject interesting "Callouts" with real-world scenarios or deeper insights. Separate these from the main text with "---" on the lines before and after, and start them with "Callout:".
  2.  **Key Takeaways**: A list of 3-5 bullet points summarizing the most important concepts from the script.
  3.  **References**: A list of the source URLs provided. Only include sources of type 'url'.

  Structure your entire output as a single JSON object that matches the required output schema.
  `,
});

const generateScriptFromSourcesFlow = ai.defineFlow(
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
