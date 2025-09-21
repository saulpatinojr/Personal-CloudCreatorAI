import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {next} from '@genkit-ai/next';
import {defineFlow} from 'genkit/flow';
import {z} from 'zod';
import {mcpClient} from 'genkitx-mcp';

// Import your flows here.
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

genkit({
  plugins: [
    googleAI(),
    mcpService,
    next({
      // The Next.js plugin exports a function that creates a route handler.
      // You can specify the flows that you want to expose to the client.
      // You can also specify an `auth` function to protect your flows.
    }),
  ],
});

// This is the Next.js route handler that will be used to run your flows.
export {POST} from 'genkit/next';
