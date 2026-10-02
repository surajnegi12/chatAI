"use client";

import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { Sparkles } from "lucide-react";

export default function ChatBox({ conversationId, onConversationCreated }) {
  const { messages, loading, isStreaming, sendMessage } = useChat(
    conversationId,
    onConversationCreated
  );
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#131314] overflow-hidden transition-colors duration-200">
      {/* Scrollable Message List */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent mb-2">
              Hello, there
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              How can I help you today?
            </p>
          </div>
        ) : (
          <div className="py-6">
            {messages.map((msg, index) => (
              <MessageItem key={msg.id || index} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Box */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}