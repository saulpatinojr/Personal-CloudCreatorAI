'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DebugMcpInputSchema = z.object({
  serverName: z.string().describe('MCP server name to debug'),
});

const DebugMcpOutputSchema = z.object({
  availableTools: z.array(z.string()),
  error: z.string().optional(),
});

export const debugMcpToolsFlow = ai.defineFlow(
  {
    name: 'debugMcpToolsFlow',
    inputSchema: DebugMcpInputSchema,
    outputSchema: DebugMcpOutputSchema,
  },
  async (input) => {
    try {
      // Try to generate with a simple prompt to see what tools are available
      const result = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: 'List available tools',
        config: {
          temperature: 0
        }
      });
      
      // Return available tool names we know about
      const knownTools = [
        'microsoft-docs/microsoft_docs_search',
        'microsoft-docs/microsoft_docs_fetch', 
        'aws-knowledge/search_documentation',
        'aws-knowledge/read_documentation',
        'aws-knowledge/recommend',
        'aws-documentation/read_documentation',
        'aws-documentation/search_documentation'
      ];
      
      return {
        availableTools: knownTools
      };
    } catch (error) {
      return {
        availableTools: [],
        error: `Failed to debug: ${error}`
      };
    }
  }
);