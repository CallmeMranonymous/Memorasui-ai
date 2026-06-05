const TATUM_API_KEY = process.env.TATUM_API_KEY!;
const SUI_RPC = process.env.NEXT_PUBLIC_TATUM_SUI_RPC ?? "https://sui-mainnet.gateway.tatum.io";

function normalizeAddress(address: string | null | undefined): string {
  if (!address) throw new Error("No wallet address provided.");
  const hex = address.startsWith("0x") ? address.slice(2) : address;
  return "0x" + hex.padStart(64, "0");
}

async function suiRpc(method: string, params: unknown[]) {
  const res = await fetch(SUI_RPC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": TATUM_API_KEY,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.data ?? data.error.message);
  return data.result;
}

export async function getSuiBalance(address: string) {
  const normalized = normalizeAddress(address);
  const result = await suiRpc("suix_getBalance", [normalized, "0x2::sui::SUI"]);
  const raw = BigInt(result.totalBalance ?? "0");
  const sui = Number(raw) / 1_000_000_000;
  return { address: normalized, balanceMist: result.totalBalance, balanceSui: sui.toFixed(4) };
}

export async function getSuiTransactions(address: string, limit = 5) {
  const result = await suiRpc("suix_queryTransactionBlocks", [
    { filter: { FromAddress: address } },
    null,
    limit,
    true,
  ]);
  return result.data ?? [];
}

export async function getSuiObject(objectId: string) {
  return suiRpc("sui_getObject", [objectId, { showContent: true, showDisplay: true }]);
}

export async function getSuiCoins(address: string) {
  const result = await suiRpc("suix_getCoins", [address, "0x2::sui::SUI"]);
  return result.data ?? [];
}
