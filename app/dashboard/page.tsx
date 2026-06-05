"use client";

import { useEffect, useState } from "react";
import { Brain, Trash2, RefreshCw, Database, Search } from "lucide-react";
import Link from "next/link";

interface Memory {
  id?: string;
  content?: string;
  text?: string;
  score?: number;
  timestamp?: string;
}

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  async function fetchMemories(q = "recent memories") {
    setLoading(true);
    try {
      const res = await fetch(`/api/memories?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setMemories(data.memories ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    await fetchMemories(query);
    setSearching(false);
  }

  useEffect(() => {
    fetchMemories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Memory Dashboard</h1>
              <p className="text-xs text-gray-400">Your on-chain memories — stored on Walrus</p>
            </div>
          </div>
          <Link
            href="/chat"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            Open Chat
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Memories", value: memories.length, icon: Database },
            { label: "Storage", value: "Walrus", icon: Brain },
            { label: "Network", value: "Sui Mainnet", icon: RefreshCw },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <Icon className="w-4 h-4 text-gray-400 mb-2" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search your memories..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={search}
            disabled={searching}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => fetchMemories()}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Memory list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading your Walrus memories...</div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No memories found. Start chatting to create some!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((mem, i) => (
              <div
                key={mem.id ?? i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-100 leading-relaxed">
                    {mem.content ?? mem.text ?? JSON.stringify(mem)}
                  </p>
                  {mem.score !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">Relevance: {(mem.score * 100).toFixed(0)}%</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                      Walrus
                    </span>
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                      Encrypted
                    </span>
                  </div>
                </div>
                <button className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
