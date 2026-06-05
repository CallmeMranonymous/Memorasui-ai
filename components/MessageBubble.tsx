"use client";

import { UIMessage, isTextUIPart, isToolUIPart, getToolName } from "ai";
import ReactMarkdown from "react-markdown";
import { Brain, User, Zap, Database } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  message: UIMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  // Collect all text from parts
  const textParts = message.parts.filter(isTextUIPart);
  const toolParts = message.parts.filter(isToolUIPart);

  // Fallback: if no text parts, check if there's a content string
  const hasText = textParts.length > 0;
  const hasTools = toolParts.length > 0;

  // Don't render empty assistant messages
  if (!isUser && !hasText && !hasTools) return null;

  return (
    <div className={clsx("flex gap-3 max-w-3xl mx-auto w-full", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
          isUser ? "bg-gray-700" : "bg-gradient-to-br from-blue-500 to-purple-600"
        )}
      >
        {isUser ? <User className="w-4 h-4 text-gray-300" /> : <Brain className="w-4 h-4 text-white" />}
      </div>

      <div className={clsx("flex flex-col gap-2 max-w-[80%]", isUser && "items-end")}>
        {/* Tool indicators */}
        {toolParts.map((part, i) => {
          const toolName = getToolName(part);
          const isMemory = toolName.includes("memory");
          const isDone = part.state === "output-available" || part.state === "output-error";

          return (
            <div
              key={`tool-${i}`}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-600 text-gray-400 bg-gray-900"
            >
              {isMemory ? (
                <Database className="w-3 h-3 text-purple-400" />
              ) : (
                <Zap className="w-3 h-3 text-blue-400" />
              )}
              <span>
                {toolName === "save_memory" && "Saving to Walrus..."}
                {toolName === "recall_memory" && "Recalling from Walrus..."}
                {toolName === "get_sui_balance" && "Checking balance via Tatum..."}
                {toolName === "get_sui_transactions" && "Fetching transactions via Tatum..."}
                {toolName === "get_sui_object" && "Inspecting Sui object..."}
                {!["save_memory","recall_memory","get_sui_balance","get_sui_transactions","get_sui_object"].includes(toolName) && toolName}
              </span>
              {isDone && <span className="text-green-400">✓</span>}
            </div>
          );
        })}

        {/* Text response — concatenate all text parts into one bubble */}
        {hasText && textParts.map((p) => p.text).join("").trim().length > 0 && !/^\s*\w+>\{/.test(textParts.map((p) => p.text).join("")) && (
          <div
            className={clsx(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed",
              isUser
                ? "bg-blue-600 text-white rounded-tr-sm"
                : "bg-gray-800 text-gray-100 rounded-tl-sm"
            )}
          >
            {isUser ? (
              textParts.map((p) => p.text).join("")
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  table: ({ children }) => <table className="text-xs border-collapse my-2 w-full">{children}</table>,
                  th: ({ children }) => <th className="border border-gray-600 px-2 py-1 bg-gray-700">{children}</th>,
                  td: ({ children }) => <td className="border border-gray-600 px-2 py-1">{children}</td>,
                  code: ({ children }) => <code className="bg-gray-700 px-1 rounded text-xs">{children}</code>,
                }}
              >
                {textParts.map((p) => p.text).join("")}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
