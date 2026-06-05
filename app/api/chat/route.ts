/* eslint-disable @typescript-eslint/no-explicit-any */
import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { getSuiBalance, getSuiTransactions, getSuiObject } from "@/lib/tatum";
import { saveMemory, searchMemory } from "@/lib/memwal";

export const maxDuration = 60;

function extractSuiAddresses(
  messages: { role: string; parts?: { type: string; text?: string }[] }[]
) {
  const text = messages
    .map((m) => m.parts?.map((p) => p.text ?? "").join(" ") ?? "")
    .join(" ");
  return text.match(/0x[0-9a-fA-F]{40,64}/g) ?? [];
}

function makeTool(description: string, parameters: object, execute: (args: any) => Promise<any>) {
  return { description, parameters, execute } as any;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const suiAddresses = extractSuiAddresses(messages);
  const defaultAddress = suiAddresses[0] ?? null;

  const tools: any = {
    save_memory: makeTool(
      "Save an important fact or preference to the user's permanent Walrus memory.",
      { type: "object", properties: { content: { type: "string" } } },
      async (args: any) => {
        const content = args?.content ?? "";
        if (!content) return { success: false };
        const job = await saveMemory(content);
        return { success: true, jobId: job.job_id };
      }
    ),
    recall_memory: makeTool(
      "Search the user's Walrus memory using a natural language query.",
      { type: "object", properties: { query: { type: "string" } } },
      async (args: any) => {
        const results = await searchMemory(args?.query ?? "recent conversations");
        const list = Array.isArray(results) ? results : [];
        return list.length === 0
          ? { found: false, memories: [], message: "No memories found." }
          : { found: true, memories: list, count: list.length };
      }
    ),
    get_sui_balance: makeTool(
      "Get the SUI balance for a wallet address via Tatum RPC.",
      { type: "object", properties: { address: { type: "string" } } },
      async (args: any) => {
        const addr = args?.address ?? defaultAddress;
        if (!addr) return { error: "No Sui address found." };
        return getSuiBalance(addr);
      }
    ),
    get_sui_transactions: makeTool(
      "Get recent transactions for a Sui wallet address via Tatum.",
      { type: "object", properties: { address: { type: "string" }, limit: { type: "number" } } },
      async (args: any) => {
        const addr = args?.address ?? defaultAddress;
        if (!addr) return { error: "No Sui address found." };
        return getSuiTransactions(addr, args?.limit ?? 5);
      }
    ),
    get_sui_object: makeTool(
      "Inspect a Sui object such as an NFT or coin via Tatum.",
      { type: "object", properties: { objectId: { type: "string" } } },
      async (args: any) => {
        const id = args?.objectId ?? defaultAddress;
        if (!id) return { error: "No object ID found." };
        return getSuiObject(id);
      }
    ),
  };

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(4),
  });

  return result.toUIMessageStreamResponse();
}
