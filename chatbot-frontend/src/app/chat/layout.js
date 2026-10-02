"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";
import { useConversations } from "@/hooks/useConversations";
import Spinner from "@/components/ui/Spinner";

export default function ChatLayout({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    conversations,
    loading: convLoading,
    refreshConversations,
    deleteConversation,
  } = useConversations();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-[#131314]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-neutral-800 dark:text-[#e3e3e3]">
      <Sidebar
        conversations={conversations}
        loading={convLoading}
        refreshConversations={refreshConversations}
        onDeleteConversation={deleteConversation}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#131314]">
        {children}
      </main>
    </div>
  );
}