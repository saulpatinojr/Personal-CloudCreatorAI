// src/app/api/genkit/[slug]/route.ts
import '@/ai/dev';
import { POST } from '@genkit-ai/next';

// This single import statement for '@/ai/dev' ensures that all flows and tools
// defined in your project are registered with the Genkit instance before the
// POST handler is exported. The POST handler from the Genkit Next.js plugin
// creates the necessary API endpoints that the client-side `runFlow` function calls.

export { POST };