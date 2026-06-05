import { NextResponse } from "next/server";
import { searchMemory, restoreMemories } from "@/lib/memwal";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "all memories";

  try {
    const memories = await searchMemory(query);
    return NextResponse.json({ memories: memories ?? [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await restoreMemories();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
