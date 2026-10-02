"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";

export default function ConversationItem({ conversation, isActive, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const openConfirmModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
    onDelete(conversation.id);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <>
      <div
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
          isActive
            ? "bg-[#dbeafe] text-blue-900 dark:bg-neutral-800 dark:text-white font-medium"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
        }`}
      >
        <Link
          href={`/chat/${conversation.id}`}
          className="flex items-center gap-3 flex-1 min-w-0 pr-2"
        >
          <MessageSquare className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200" />
          <span className="truncate">{conversation.title || "New Chat"}</span>
        </Link>

        <button
          onClick={openConfirmModal}
          title="Delete conversation"
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-neutral-300 dark:hover:bg-neutral-700/60 rounded transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          onClick={handleCancel}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Delete conversation?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 leading-normal">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}