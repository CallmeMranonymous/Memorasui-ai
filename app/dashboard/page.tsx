"use client";

import { useEffect, useState } from "react";
import { Brain, Trash2, Database, Search, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Memory {
  id: string;
  content: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Load memories saved in localStorage by the chat
    const stored = localStorage.getItem("memorasui_memories");
    if (stored) {
      try {
        setMemories(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function deleteMemory(id: string) {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    localStorage.setItem("memorasui_memories", JSON.stringify(updated));
  }

  const filtered = query
    ? memories.filter((m) => m.content.toLowerCase().includes(query.toLowerCase()))
    : memories;

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
          <Link href="/chat" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
            Open Chat
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <Database className="w-4 h-4 text-gray-400 mb-2" />
            <p className="text-2xl font-bold">{memories.length}</p>
            <p className="text-xs text-gray-400">Total Memories</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <Brain className="w-4 h-4 text-purple-400 mb-2" />
            <p className="text-2xl font-bold">Walrus</p>
            <p className="text-xs text-gray-400">Storage Layer</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <RefreshCw className="w-4 h-4 text-blue-400 mb-2" />
            <p className="text-2xl font-bold">Sui Mainnet</p>
            <p className="text-xs text-gray-400">Network</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your memories..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Memory list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No memories yet. Start chatting to create some!</p>
            <Link href="/chat" className="mt-4 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors">
              Start Chatting
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((mem) => (
              <div key={mem.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-gray-600 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-100 leading-relaxed">{mem.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(mem.timestamp).toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">Walrus</span>
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">Encrypted</span>
                  </div>
                </div>
                <button onClick={() => deleteMemory(mem.id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
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
