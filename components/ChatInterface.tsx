"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Brain, Loader2, Database, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: string[];
}

const STARTER_PROMPTS = [
  "My name is Mega and I'm building DeFi on Sui",
  "Check my Sui balance at 0x721917469b2b6f910cf0bc1863c3fb1c98e9d81a2b67ff84871166e1fcf90827",
  "What do you remember about me?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const assistantId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "", toolCalls: [] },
    ]);
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.content }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      // Read full response text then parse all SSE events at once
      const fullText = await res.text();
      const lines = fullText.split("\n");

      let assistantText = "";
      const toolCallsFound: string[] = [];

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === "[DONE]") continue;

        try {
          const event = JSON.parse(raw);

          if (event.type === "text-delta") {
            assistantText += event.delta;
          }

          if (event.type === "tool-input-available") {
            const name = event.toolName as string;
            if (name && !toolCallsFound.includes(name)) {
              toolCallsFound.push(name);
              // When save_memory fires, store the user's message in localStorage for dashboard
              if (name === "save_memory") {
                try {
                  const stored = localStorage.getItem("memorasui_memories");
                  const existing = stored ? JSON.parse(stored) : [];
                  existing.unshift({
                    id: Date.now().toString(),
                    content: text, // user's message text
                    timestamp: new Date().toISOString()
                  });
                  localStorage.setItem("memorasui_memories", JSON.stringify(existing.slice(0, 50)));
                } catch {}
              }
            }
          }
        } catch {
          // ignore malformed lines
        }
      }

      // Update once with final state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: assistantText, toolCalls: toolCallsFound }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <a href="/" className="font-semibold text-white hover:text-blue-400 transition-colors">
            MemoraSui AI
          </a>
          <p className="text-xs text-gray-400">Memory on Walrus · Actions on Sui via Tatum</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Your AI with permanent memory</h2>
            <p className="text-gray-400 max-w-sm text-sm">
              Every conversation is encrypted and stored on Walrus. I remember you — and can act on Sui.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-2 w-full max-w-sm">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left px-4 py-2 rounded-lg border border-gray-700 hover:border-blue-500 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === "user";
          const isThinking = !isUser && isLoading && !m.content && (!m.toolCalls || m.toolCalls.length === 0);

          return (
            <div key={m.id} className={`flex gap-3 max-w-3xl mx-auto w-full ${isUser ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? "bg-gray-700" : "bg-gradient-to-br from-blue-500 to-purple-600"}`}>
                {isUser
                  ? <span className="text-xs text-gray-300">U</span>
                  : <Brain className="w-4 h-4 text-white" />}
              </div>

              <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? "items-end" : ""}`}>
                {/* Tool indicators */}
                {!isUser && m.toolCalls && m.toolCalls.map((toolName, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-600 text-gray-400 bg-gray-900">
                    {toolName.includes("memory")
                      ? <Database className="w-3 h-3 text-purple-400" />
                      : <Zap className="w-3 h-3 text-blue-400" />}
                    <span>
                      {toolName === "save_memory" && "Saving to Walrus... ✓"}
                      {toolName === "recall_memory" && "Recalling from Walrus... ✓"}
                      {toolName === "get_sui_balance" && "Checking balance via Tatum... ✓"}
                      {toolName === "get_sui_transactions" && "Fetching transactions via Tatum... ✓"}
                      {toolName === "get_sui_object" && "Inspecting Sui object... ✓"}
                    </span>
                  </div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <div className="px-4 py-3 rounded-2xl bg-gray-800 text-gray-400 text-sm animate-pulse">
                    Thinking...
                  </div>
                )}

                {/* Text bubble */}
                {m.content && (
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-800 text-gray-100 rounded-tl-sm"}`}>
                    {isUser ? m.content : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          li: ({ children }) => <li>{children}</li>,
                          code: ({ children }) => <code className="bg-gray-700 px-1 rounded text-xs font-mono">{children}</code>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-2 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Talk to your AI... (Shift+Enter for new line)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={submit}
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          Memories stored on Walrus · Blockchain data via Tatum
        </p>
      </div>
    </div>
  );
}
