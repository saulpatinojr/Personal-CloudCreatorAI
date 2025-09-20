import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {mcpClient} from 'genkitx-mcp';

// TODO: Replace with your actual MCP server URL.
const MCP_SERVER_URL = 'https://learn.microsoft.com/api/mcp';

// This creates a Genkit plugin that acts as a client for an MCP server.
// Tools and prompts from the MCP server will be automatically available in Genkit,
// namespaced with 'mcp_service' (e.g., 'mcp_service/myTool').
const mcpService = mcpClient({
  name: 'mcp_service', // A namespace for the tools and prompts from this server.
  serverUrl: MCP_SERVER_URL,
});

export const ai = genkit({
  plugins: [
    googleAI(),
    mcpService, // Add the MCP client plugin.
  ],
});
