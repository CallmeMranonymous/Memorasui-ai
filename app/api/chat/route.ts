import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages, stepCountIs, tool } from "ai";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { tools as memoryTools } from "@/lib/tools";
import { getSuiBalance, getSuiTransactions, getSuiObject } from "@/lib/tatum";
import { saveMemory, searchMemory } from "@/lib/memwal";

export const maxDuration = 60;

function extractSuiAddresses(messages: { role: string; parts?: { type: string; text?: string }[] }[]) {
  const text = messages
    .map((m) => m.parts?.map((p) => p.text ?? "").join(" ") ?? "")
    .join(" ");
  return text.match(/0x[0-9a-fA-F]{40,64}/g) ?? [];
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Extract any Sui addresses from the conversation upfront
  const suiAddresses = extractSuiAddresses(messages);
  const defaultAddress = suiAddresses[0] ?? null;

  // Build request-scoped tools with address fallback baked in
  const requestTools = {
    save_memory: tool({
      description: "Save an important fact, preference, or event to the user's permanent Walrus memory.",
      parameters: z.object({ content: z.string() }),
      execute: async (args: { content?: string } | null) => {
        const content = args?.content ?? "";
        if (!content) return { success: false };
        const job = await saveMemory(content);
        return { success: true, jobId: job.job_id };
      },
    }),
    recall_memory: tool({
      description: "Search the user's Walrus memory using a natural language query.",
      parameters: z.object({ query: z.string() }),
      execute: async (args: { query?: string } | null) => {
        const query = args?.query ?? "recent conversations";
        const results = await searchMemory(query);
        const list = Array.isArray(results) ? results : [];
        return list.length === 0
          ? { found: false, memories: [], message: "No memories found." }
          : { found: true, memories: list, count: list.length };
      },
    }),
    get_sui_balance: tool({
      description: "Get the SUI balance for a wallet address via Tatum RPC.",
      parameters: z.object({ address: z.string().optional() }),
      execute: async (args: { address?: string } | null) => {
        const address = args?.address ?? defaultAddress;
        if (!address) return { error: "No Sui address found in your message." };
        return getSuiBalance(address);
      },
    }),
    get_sui_transactions: tool({
      description: "Get recent transactions for a Sui wallet address via Tatum.",
      parameters: z.object({ address: z.string().optional(), limit: z.number().optional() }),
      execute: async (args: { address?: string; limit?: number } | null) => {
        const address = args?.address ?? defaultAddress;
        if (!address) return { error: "No Sui address found in your message." };
        return getSuiTransactions(address, args?.limit ?? 5);
      },
    }),
    get_sui_object: tool({
      description: "Inspect a Sui object such as an NFT or coin via Tatum.",
      parameters: z.object({ objectId: z.string().optional() }),
      execute: async (args: { objectId?: string } | null) => {
        const objectId = args?.objectId ?? defaultAddress;
        if (!objectId) return { error: "No object ID found in your message." };
        return getSuiObject(objectId);
      },
    }),
  };

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: requestTools,
    stopWhen: stepCountIs(4),
  });

  return result.toUIMessageStreamResponse();
}
