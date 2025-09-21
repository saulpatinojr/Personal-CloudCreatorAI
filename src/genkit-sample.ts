import {googleAI} from "@genkit-ai/googleai";
import {configureGenkit} from "genkit";
import {defineFlow, startFlowsServer} from "@genkit-ai/firebase";
import * as z from "zod";
import {v4 as uuidv4} from "uuid";

configureGenkit({
  plugins: [
    googleAI(),
  ],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

export const menuSuggestionFlow = defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const prompt =
      `Suggest an item for a menu about ${subject}. ` +
      `For example, if the user asks for " appetizer", you could suggest "Spring Rolls".`;

    const llmResponse = await generate({
      prompt: prompt,
      model: googleAI.model("gemini-1.5-flash"),
      output: {
        format: "text",
      },
    });

    return llmResponse.text();
  }
);

// This is an example of a flow that uses a tool.
const checkDietaryRestrictions = async (input: { food: string, restrictions: string[] }) => {
  const prompt = `Check if ${input.food} is safe for people with the following dietary restrictions: ${input.restrictions.join(", ")}.`;
  const llmResponse = await generate({
    prompt: prompt,
    model: googleAI.model("gemini-1.5-flash"),
    output: {
      format: "text",
    },
  });
  return llmResponse.text();
}

export const fancyMenuSuggestionFlow = defineFlow(
  {
    name: "fancyMenuSuggestionFlow",
    inputSchema: z.object({
      style: z.string(),
      restrictions: z.array(z.string()),
    }),
    outputSchema: z.string(),
    tools: [checkDietaryRestrictions],
  },
  async (input) => {
    const prompt =
      `Suggest a fancy menu item in the style of ${input.style}. `;

    const llmResponse = await generate({
      prompt: prompt,
      model: googleAI.model("gemini-1.5-flash"),
      output: {
        format: "text",
      },
      tools: [checkDietaryRestrictions],
    });

    return llmResponse.text();
  }
);

startFlowsServer();
