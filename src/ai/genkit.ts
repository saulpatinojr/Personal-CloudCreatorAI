import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { microsoftDocsClient, awsKnowledgeClient, awsDocumentationClient } from './mcp-config';

export const ai = genkit({
  plugins: [
    googleAI(),
    microsoftDocsClient,
    awsKnowledgeClient,
    awsDocumentationClient,
  ],
});
