"use client";

import { useParams } from "next/navigation";
import ChatBox from "@/components/chat/ChatBox";
import { useConversations } from "@/hooks/useConversations";

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params?.id;
  const { refreshConversations } = useConversations();

  return (
    <ChatBox
      conversationId={conversationId}
      onConversationCreated={refreshConversations}
    />
  );
}