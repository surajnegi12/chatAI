"use client";

import { useState, useEffect, useCallback } from "react";
import { chatApi } from "@/lib/api";
import { SENDER } from "@/lib/constants";

export function useChat(conversationId, onConversationCreated) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    try {
      setLoading(true);
      const data = await chatApi.getMessages(conversationId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (text, imageBase64 = null, imageMimeType = null) => {
    if (!text?.trim() && !imageBase64) return;

    // Optimistically render user turn with attached image preview
    const userMessage = {
      content: text,
      imagePreview: imageBase64,
      sender: SENDER.USER,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    let streamedContent = "";
    setIsStreaming(true);

    const payload = {
      conversationId: conversationId ? Number(conversationId) : null,
      message: text,
      imageBase64: imageBase64,
      imageMimeType: imageMimeType,
    };

    try {
      await chatApi.streamMessage(
        payload,
        (chunk) => {
          streamedContent += chunk;
          setMessages((prev) => {
            const hasBotPlaceholder =
              prev.length > 0 &&
              prev[prev.length - 1].sender === SENDER.BOT &&
              prev[prev.length - 1].isStreaming;

            if (hasBotPlaceholder) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: streamedContent,
              };
              return updated;
            } else {
              return [
                ...prev,
                {
                  sender: SENDER.BOT,
                  content: streamedContent,
                  timestamp: new Date().toISOString(),
                  isStreaming: true,
                },
              ];
            }
          });
        },
        async () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.isStreaming ? { ...msg, isStreaming: false } : msg
            )
          );
          setIsStreaming(false);

          if (onConversationCreated) {
            await onConversationCreated();
          }
        },
        (error) => {
          console.error("Error streaming reply:", error);
          setIsStreaming(false);
        }
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setIsStreaming(false);
    }
  };

  return {
    messages,
    loading,
    isStreaming,
    sendMessage,
  };
}