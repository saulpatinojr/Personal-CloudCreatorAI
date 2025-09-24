// src/app/api/genkit/[slug]/route.ts
import '@/ai/dev';
import { ai } from '@/ai/genkit';
import { POST } from '@genkit-ai/next';

// By importing the ai instance, all flows and tools are automatically registered.
// This single instance is now used by both the client-side API route and server-side logic.

// Export the POST handler from the Genkit Next.js plugin.
// This creates the API endpoint that the client-side `runFlow` function calls.
export { POST };
