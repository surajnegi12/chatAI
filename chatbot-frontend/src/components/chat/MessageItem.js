"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, User } from "lucide-react";
import { SENDER } from "@/lib/constants";

export default function MessageItem({ message }) {
  const isUser = message.sender === SENDER.USER;
  const imageSource = message.imagePreview || message.imageBase64;

  return (
    <div className="w-full py-6">
      <div className="max-w-3xl mx-auto px-4 flex gap-4 sm:gap-6 items-start">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            isUser
              ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-sm"
              : "bg-transparent text-blue-400"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-400 fill-blue-400/20" />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="text-xs font-medium text-neutral-400 tracking-wide uppercase">
            {isUser ? "You" : "Gemini"}
          </div>

          {/* Attached image preview */}
          {imageSource && (
            <div className="inline-block rounded-xl overflow-hidden border border-neutral-700/60 bg-neutral-900/60 shadow-md">
              <img
                src={imageSource}
                alt="User upload"
                className="max-h-72 w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          )}

          {/* Markdown Output */}
          <div className="markdown-body text-[15px] leading-7 text-neutral-200 break-words font-normal">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}