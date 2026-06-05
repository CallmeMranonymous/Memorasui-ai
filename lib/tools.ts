import { tool } from "ai";
import { z } from "zod";
import { saveMemory, searchMemory } from "./memwal";
import { getSuiBalance, getSuiTransactions, getSuiObject } from "./tatum";

export const tools = {
  save_memory: tool({
    description:
      "Save an important fact, preference, or event to the user's permanent Walrus memory. Call this whenever the user shares something worth remembering.",
    parameters: z.object({
      content: z.string().describe("The information to remember. Be specific and include context."),
    }),
    execute: async (args: { content?: string } | null) => {
      const content = args?.content ?? "";
      if (!content) return { success: false, message: "No content provided." };
      const job = await saveMemory(content);
      return { success: true, jobId: job.job_id, message: `Saved to Walrus: "${content}"` };
    },
  }),

  recall_memory: tool({
    description:
      "Search the user's Walrus memory using a natural language query. Use this to recall past conversations, preferences, or facts.",
    parameters: z.object({
      query: z.string().describe("Natural language query to search memories"),
    }),
    execute: async (args: { query?: string } | null) => {
      const query = args?.query ?? "recent conversations";
      const results = await searchMemory(query);
      const list = Array.isArray(results) ? results : [];
      if (list.length === 0) {
        return { found: false, memories: [], message: "No relevant memories found." };
      }
      return { found: true, memories: list, count: list.length };
    },
  }),

  get_sui_balance: tool({
    description: "Get the SUI balance for a Sui wallet address using Tatum's RPC nodes.",
    parameters: z.object({
      address: z.string().describe("Sui wallet address starting with 0x"),
    }),
    execute: async (args: { address?: string } | null) => {
      if (!args?.address) return { error: "Please provide a Sui wallet address." };
      return getSuiBalance(args.address);
    },
  }),

  get_sui_transactions: tool({
    description: "Get recent transactions for a Sui wallet address via Tatum.",
    parameters: z.object({
      address: z.string().describe("Sui wallet address"),
      limit: z.number().optional().default(5).describe("Number of transactions to return"),
    }),
    execute: async (args: { address?: string; limit?: number } | null) => {
      if (!args?.address) return { error: "Please provide a Sui wallet address." };
      return getSuiTransactions(args.address, args.limit ?? 5);
    },
  }),

  get_sui_object: tool({
    description: "Inspect a Sui object such as an NFT or coin using Tatum.",
    parameters: z.object({
      objectId: z.string().describe("Sui object ID starting with 0x"),
    }),
    execute: async (args: { objectId?: string } | null) => {
      if (!args?.objectId) return { error: "Please provide a Sui object ID." };
      return getSuiObject(args.objectId);
    },
  }),
};
