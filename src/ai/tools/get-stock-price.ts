'use server';
/**
 * @fileOverview A Genkit tool for fetching the stock price of a company.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getStockPriceTool = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Returns the current market value of a stock for a given ticker symbol.',
    inputSchema: z.object({
      ticker: z.string().describe('The ticker symbol of the stock (e.g., "GOOGL", "MSFT").'),
    }),
    outputSchema: z.object({
        price: z.number().describe('The current price of the stock.'),
    }),
  },
  async (input) => {
    console.log(`[getStockPrice] Fetching price for ${input.ticker}`);
    // In a real application, you would call a stock market API here.
    // For this example, we'll return a random price.
    const price = parseFloat((Math.random() * 1000 + 100).toFixed(2));
    return { price };
  }
);
