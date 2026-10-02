import { API_BASE_URL, STORAGE_KEYS } from "./constants";

export async function apiFetch(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      // Read stream once as plain text
      const rawText = await response.text();
      try {
        const errorData = JSON.parse(rawText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        if (rawText && rawText.trim().length > 0) {
          errorMessage = rawText.trim();
        }
      }
    } catch {
      // Stream could not be read
    }
    throw new Error(errorMessage || `HTTP Error ${response.status}`);
  }

  return response;
}

export const authApi = {
  signup: async (data) => {
    const res = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },
  login: async (data) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export const chatApi = {
  getConversations: async () => {
    const res = await apiFetch("/api/chat/conversations");
    return res.json();
  },
  getMessages: async (conversationId) => {
    const res = await apiFetch(`/api/chat/conversations/${conversationId}/messages`);
    return res.json();
  },
  deleteConversation: async (conversationId) => {
    await apiFetch(`/api/chat/conversations/${conversationId}`, {
      method: "DELETE",
    });
  },
  sendMessageSync: async (data) => {
    const res = await apiFetch("/api/chat/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },
  streamMessage: async (data, onChunk, onDone, onError) => {
    try {
      const res = await apiFetch("/api/chat/stream", {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
        },
        body: JSON.stringify(data),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const content = line.replace(/^data:\s*/, "");
            if (content) onChunk(content);
          } else if (line.trim().length > 0) {
            onChunk(line);
          }
        }
      }

      if (onDone) onDone();
    } catch (err) {
      if (onError) onError(err);
      else console.error("SSE Streaming error:", err);
    }
  },
};