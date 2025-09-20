'use server';

/**
 * @fileOverview A flow to read a file using a tool from an MCP server.
 *
 * - readMcpFile - A function that reads a file path.
 * - ReadMcpFileInput - The input type for the readMcpFile function.
 * - ReadMcpFileOutput - The return type for the readMcpFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { readFile } from 'genkitx-mcp';

const ReadMcpFileInputSchema = z.object({
  path: z.string().describe('The path to the file to read.'),
});
export type ReadMcpFileInput = z.infer<typeof ReadMcpFileInputSchema>;

const ReadMcpFileOutputSchema = z.object({
  content: z.string().describe('The content of the file.'),
});
export type ReadMcpFileOutput = z.infer<typeof ReadMcpFileOutputSchema>;

export async function readMcpFile(input: ReadMcpFileInput): Promise<ReadMcpFileOutput> {
  return readMcpFileFlow(input);
}

const readMcpFileFlow = ai.defineFlow(
  {
    name: 'readMcpFileFlow',
    inputSchema: ReadMcpFileInputSchema,
    outputSchema: ReadMcpFileOutputSchema,
  },
  async (input) => {
    // We directly call the tool provided by the MCP plugin.
    // The tool is namespaced with the client name ('filesystem').
    const content = await readFile('filesystem', { path: input.path });

    // The tool might return a complex object, so we handle it gracefully.
    let fileContent = '';
    if (typeof content === 'string') {
        fileContent = content;
    } else if (Array.isArray(content) && content.length > 0 && 'text' in content[0]) {
        fileContent = content.map(c => c.text).join('\n');
    } else {
        fileContent = JSON.stringify(content, null, 2);
    }

    return { content: fileContent };
  }
);
