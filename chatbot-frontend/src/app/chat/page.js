"use client";

import ChatBox from "@/components/chat/ChatBox";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { chatApi } from "@/lib/api";

export default function NewChatPage() {
  const router = useRouter();
  const { refreshConversations } = useConversations();

  const handleCreated = async () => {
    const updated = await chatApi.getConversations();
    await refreshConversations();
    if (updated && updated.length > 0) {
      router.replace(`/chat/${updated[0].id}`);
    }
  };

  return (
    <ChatBox
      conversationId={null}
      onConversationCreated={handleCreated}
    />
  );
}