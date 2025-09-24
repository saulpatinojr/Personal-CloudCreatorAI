'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhancedScriptInputSchema = z.object({
  topic: z.string(),
  sources: z.array(z.object({
    type: z.enum(['url', 'pdf', 'text']),
    name: z.string(),
    content: z.string(),
  })),
});

const EnhancedScriptOutputSchema = z.object({
  script: z.string(),
  takeaways: z.array(z.string()),
  references: z.array(z.string()),
  azureInsights: z.array(z.string()).optional(),
  awsComparisons: z.array(z.string()).optional(),
});

export const enhancedScriptFlow = ai.defineFlow(
  {
    name: 'enhancedScriptFlow',
    inputSchema: EnhancedScriptInputSchema,
    outputSchema: EnhancedScriptOutputSchema,
  },
  async (input) => {
    // Use Microsoft Docs MCP for official Azure documentation
    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Create a comprehensive podcast script about ${input.topic}. Search Microsoft docs for official Azure documentation, then use all available information including your knowledge of AWS.
      
      Topic: ${input.topic}
      Sources: ${JSON.stringify(input.sources)}
      
      First search Microsoft docs for this topic, then generate a detailed script with takeaways and references. Include AWS comparisons based on your knowledge.`,
      tools: ['microsoft-docs/microsoft_docs_search'],
      output: { schema: EnhancedScriptOutputSchema },
    });

    return result.output!;
  }
);