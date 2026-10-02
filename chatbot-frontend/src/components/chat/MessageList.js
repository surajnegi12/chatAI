"use client";

import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import Spinner from "../ui/Spinner";

export default function MessageList({ messages, loading, isStreaming }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-blue-400 mb-3 font-semibold text-lg">
          ✦
        </div>
        <h2 className="text-xl font-medium text-neutral-200 mb-1">
          How can I help you today?
        </h2>
        <p className="text-sm text-neutral-500 max-w-sm">
          Start a conversation with the AI chatbot.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full py-4 flex flex-col">
        {messages.map((msg, index) => (
          <MessageItem key={msg.id || index} message={msg} />
        ))}
        {isStreaming && (
          <div className="py-2 px-6 flex items-center gap-2 text-xs text-neutral-400">
            <Spinner size="sm" />
            <span>AI chatbot is generating response...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}