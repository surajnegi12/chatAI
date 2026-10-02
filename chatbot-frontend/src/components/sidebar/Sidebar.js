"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus, LogOut, MessageCircle, Sun, Moon } from "lucide-react";
import ConversationItem from "./ConversationItem";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Spinner from "../ui/Spinner";

export default function Sidebar({
  conversations,
  loading,
  refreshConversations,
  onDeleteConversation,
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const params = useParams();
  const activeId = params?.id ? Number(params.id) : null;
  const router = useRouter();

  const handleNewChat = async (e) => {
    e.preventDefault();
    if (refreshConversations) {
      await refreshConversations();
    }
    router.push("/chat");
  };

  return (
    <aside className="w-64 bg-[#f0f4f9] dark:bg-[#1e1f20] border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full select-none shrink-0 transition-colors duration-200">
      {/* Top Header & New Chat */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight text-base">
              AI Chatbot
            </span>
          </div>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-600" />
              )}
            </button>
          )}
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-neutral-800 dark:text-neutral-100 rounded-full text-sm font-medium transition-colors border border-neutral-300 dark:border-neutral-700/70 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 mb-2">
          Recent Chats
        </p>
        {loading ? (
          <div className="flex justify-center p-6">
            <Spinner size="sm" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 px-3 py-4 text-center">
            No conversations yet.
          </p>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeId === conv.id}
              onDelete={onDeleteConversation}
            />
          ))
        )}
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-[#e9eef6] dark:bg-neutral-900/60 transition-colors">
        <div className="min-w-0 pr-2">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}