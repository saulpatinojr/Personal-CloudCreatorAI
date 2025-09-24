'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TestMcpInputSchema = z.object({
  testQuery: z.string().describe('Test query to verify MCP connections'),
});

const TestMcpOutputSchema = z.object({
  microsoftDocsResult: z.string().optional(),
  awsKnowledgeResult: z.string().optional(), 
  awsDocsResult: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export const testMcpConnectionsFlow = ai.defineFlow(
  {
    name: 'testMcpConnectionsFlow',
    inputSchema: TestMcpInputSchema,
    outputSchema: TestMcpOutputSchema,
  },
  async (input) => {
    const results: any = { errors: [] };

    // Test Microsoft Docs MCP
    // Test Microsoft Docs MCP
    try {
      const msResult = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `Search Microsoft docs for: ${input.testQuery}`,
        tools: ['microsoft-docs/microsoft_docs_search'],
      });
      results.microsoftDocsResult = `SUCCESS: ${msResult.text?.substring(0, 100)}...`;
    } catch (error) {
      results.errors.push(`Microsoft Docs MCP failed: ${error}`);
    }

    // Test AWS Knowledge MCP with different tool names
    // AWS Knowledge MCP official tool names (try both namespaced and non-namespaced)
    const awsToolNames = [
      'search_documentation',
      'read_documentation', 
      'recommend',
      'aws-knowledge/search_documentation',
      'aws-knowledge/read_documentation', 
      'aws-knowledge/recommend'
    ];
    
    let awsSuccess = false;
    let awsErrors = [];
    for (const toolName of awsToolNames) {
      try {
        const awsResult = await ai.generate({
          model: 'googleai/gemini-1.5-flash',
          prompt: `Search AWS knowledge for: ${input.testQuery}`,
          tools: [toolName],
        });
        results.awsKnowledgeResult = `SUCCESS with ${toolName}: ${awsResult.text?.substring(0, 100)}...`;
        awsSuccess = true;
        break;
      } catch (error) {
        awsErrors.push(`${toolName}: ${error.message}`);
      }
    }
    
    if (!awsSuccess) {
      results.errors.push(`AWS Knowledge MCP failed: ${awsErrors.join(', ')}`);
    }

    // Test AWS Documentation MCP
    const awsDocsToolNames = [
      'aws-documentation/read_documentation',
      'aws-documentation/search_documentation', 
      'read_documentation',
      'search_documentation'
    ];
    
    let awsDocsSuccess = false;
    for (const toolName of awsDocsToolNames) {
      try {
        const awsDocsResult = await ai.generate({
          model: 'googleai/gemini-1.5-flash',
          prompt: `Search AWS documentation for: ${input.testQuery}`,
          tools: [toolName],
        });
        results.awsDocsResult = `SUCCESS with ${toolName}: ${awsDocsResult.text?.substring(0, 100)}...`;
        awsDocsSuccess = true;
        break;
      } catch (error) {
        // Continue to next tool name
      }
    }
    
    if (!awsDocsSuccess) {
      results.errors.push('AWS Documentation MCP failed: No working tool names found');
    }

    return results;
  }
);