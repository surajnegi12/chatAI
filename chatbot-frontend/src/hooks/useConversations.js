"use client";

import { useState, useEffect, useCallback } from "react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await chatApi.getConversations();
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const deleteConversation = async (conversationId) => {
    try {
      await chatApi.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (params?.id && Number(params.id) === conversationId) {
        router.push("/chat");
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  return {
    conversations,
    loading,
    refreshConversations: fetchConversations,
    deleteConversation,
  };
}