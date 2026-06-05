import Link from "next/link";
import { Brain, Zap, Database, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
            <Brain className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">
            Memoria<span className="text-blue-400">Sui</span>
          </h1>
          <p className="text-xl text-gray-400">
            The first AI agent whose memory you actually own.
          </p>
          <p className="text-sm text-gray-500">
            Encrypted on <span className="text-purple-400 font-medium">Walrus</span> · Actions via{" "}
            <span className="text-blue-400 font-medium">Tatum</span> · Owned on{" "}
            <span className="text-cyan-400 font-medium">Sui</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-left">
          {[
            {
              icon: Database,
              color: "text-purple-400",
              title: "Permanent Memory",
              desc: "Stored encrypted on Walrus. Never deleted by a corporation.",
            },
            {
              icon: Zap,
              color: "text-blue-400",
              title: "On-Chain Actions",
              desc: "Check balances, inspect NFTs, track txs — all via Tatum.",
            },
            {
              icon: Shield,
              color: "text-green-400",
              title: "You Own It",
              desc: "Memory is gated by your Sui wallet. No one else can read it.",
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
          >
            Start Chatting
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold transition-colors"
          >
            My Memories
          </Link>
        </div>

        <p className="text-xs text-gray-600">
          Built for the Tatum × Walrus Hackathon · Powered by MemWal SDK
        </p>
      </div>
    </main>
  );
}
