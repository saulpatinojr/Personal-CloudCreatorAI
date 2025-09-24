// src/app/api/genkit/[slug]/route.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import next from '@genkit-ai/next';
import { mcpClient } from 'genkitx-mcp';

// Import all flows and tools to ensure they are registered with Genkit.
import '@/ai/flows/insert-callouts';
import '@/ai/flows/summarize-article';
import '@/ai/flows/generate-script-from-topic';
import '@/ai/flows/generate-market-summary';
import '@/ai/flows/generate-catchy-titles';
import '@/ai/flows/generate-script-from-sources';
import '@/ai/tools/get-stock-price';

const MCP_SERVER_URL = 'https://learn.microsoft.com/api/mcp';
const mcpService = mcpClient({
  name: 'mcp_service',
  serverUrl: MCP_SERVER_URL,
});

// Initialize Genkit with plugins. This makes the flows available to the handler.
genkit({
  plugins: [
    googleAI(),
    mcpService,
    next(), // The Next.js plugin provides the route handler.
  ],
});

// Export the POST handler from the Genkit Next.js plugin.
// This creates the API endpoint that the client-side `runFlow` function calls.
export { POST } from '@genkit-ai/next';
