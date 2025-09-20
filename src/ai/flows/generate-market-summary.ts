'use server';

/**
 * @fileOverview A flow to generate a market summary for a given company, using a tool to fetch its stock price.
 *
 * - generateMarketSummary - A function that generates the market summary.
 * - MarketSummaryInput - The input type for the generateMarketSummary function.
 * - MarketSummaryOutput - The return type for the generateMarketSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStockPriceTool } from '@/ai/tools/get-stock-price';

const MarketSummaryInputSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  ticker: z.string().describe('The stock ticker symbol for the company.'),
});
export type MarketSummaryInput = z.infer<typeof MarketSummaryInputSchema>;

const MarketSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated market summary.'),
});
export type MarketSummaryOutput = z.infer<typeof MarketSummaryOutputSchema>;

export async function generateMarketSummary(input: MarketSummaryInput): Promise<MarketSummaryOutput> {
  return generateMarketSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketSummaryPrompt',
  input: { schema: MarketSummaryInputSchema },
  output: { schema: MarketSummaryOutputSchema },
  tools: [getStockPriceTool],
  prompt: `You are a financial analyst. Generate a brief market summary for {{{companyName}}}.
  
  Use the getStockPrice tool to find the current stock price for the ticker symbol {{{ticker}}} and include it in your summary.
  `,
});

const generateMarketSummaryFlow = ai.defineFlow(
  {
    name: 'generateMarketSummaryFlow',
    inputSchema: MarketSummaryInputSchema,
    outputSchema: MarketSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
