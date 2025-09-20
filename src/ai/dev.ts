import { config } from 'dotenv';
config();

import '@/ai/flows/insert-callouts.ts';
import '@/ai/flows/summarize-article.ts';
import '@/ai/flows/generate-script-from-topic.ts';
import '@/ai/flows/generate-market-summary.ts';
import '@/ai/flows/generate-catchy-titles.ts';
import '@/ai/flows/generate-script-from-sources.ts';
