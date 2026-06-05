import { MemWal } from "@mysten-incubation/memwal";

let client: ReturnType<typeof MemWal.create> | null = null;
let restored = false; // track if we've restored the index this session

function getClient() {
  if (!client) {
    client = MemWal.create({
      key: process.env.MEMWAL_DELEGATE_KEY!,
      accountId: process.env.MEMWAL_ACCOUNT_ID!,
      serverUrl: process.env.MEMWAL_SERVER_URL!,
      namespace: process.env.MEMWAL_NAMESPACE ?? "memorasui",
    });
  }
  return client;
}

export async function saveMemory(text: string) {
  try {
    const memwal = getClient();
    const job = await memwal.remember(text);
    await memwal.waitForRememberJob(job.job_id);
    return job;
  } catch (err) {
    console.error("[MemWal] saveMemory failed:", err);
    return { job_id: "error", error: String(err) };
  }
}

export async function searchMemory(query: string) {
  try {
    const memwal = getClient();
    // Restore index on first recall of each server instance
    if (!restored) {
      try {
        await memwal.restore(process.env.MEMWAL_NAMESPACE ?? "memorasui");
        restored = true;
        console.log("[MemWal] index restored");
      } catch (e) {
        console.error("[MemWal] restore failed:", e);
      }
    }
    const results = await memwal.recall({ query });
    return results;
  } catch (err) {
    console.error("[MemWal] searchMemory failed:", err);
    return [];
  }
}

export async function restoreMemories() {
  try {
    const memwal = getClient();
    const result = await memwal.restore(process.env.MEMWAL_NAMESPACE ?? "memorasui");
    restored = true;
    return result;
  } catch (err) {
    console.error("[MemWal] restoreMemories failed:", err);
    return null;
  }
}
