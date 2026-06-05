import { MemWal } from "@mysten-incubation/memwal";

let client: ReturnType<typeof MemWal.create> | null = null;

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
    return memwal.restore(process.env.MEMWAL_NAMESPACE ?? "memorasui");
  } catch (err) {
    console.error("[MemWal] restoreMemories failed:", err);
    return null;
  }
}
