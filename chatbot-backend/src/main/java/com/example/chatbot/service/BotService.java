package com.example.chatbot.service;

import com.example.chatbot.model.ChatMessage;
import com.example.chatbot.model.SenderType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BotService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String modelName;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateBotReply(List<ChatMessage> conversationHistory, String currentMessage, String imageBase64, String mimeType) {
        String cleanKey = apiKey != null ? apiKey.trim() : "";
        String cleanModel = modelName != null ? modelName.trim() : "gemini-2.5-flash";

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + cleanModel + ":generateContent?key=" + cleanKey;

        Map<String, Object> requestBody = Map.of(
                "contents", buildContents(conversationHistory, currentMessage, imageBase64, mimeType)
        );

        try {
            Map<?, ?> response = webClient.post()
                    .uri(url)
                    .header("x-goog-api-key", cleanKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                            .filter(t -> t instanceof WebClientResponseException.ServiceUnavailable))
                    .block();

            if (response == null || !response.containsKey("candidates")) {
                return "No response received from Gemini.";
            }

            List<?> candidates = (List<?>) response.get("candidates");
            if (candidates.isEmpty()) return "No candidates returned by Gemini.";

            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");

            StringBuilder reply = new StringBuilder();
            for (Object partObj : parts) {
                if (partObj instanceof Map<?, ?> partMap) {
                    if (partMap.get("thought") instanceof Boolean isThought && isThought) continue;
                    Object textObj = partMap.get("text");
                    if (textObj != null) reply.append(textObj.toString());
                }
            }
            return reply.length() > 0 ? reply.toString() : "Empty response received.";
        } catch (Exception ex) {
            return "Error calling Gemini API: " + ex.getMessage();
        }
    }

    public Flux<String> streamBotReply(List<ChatMessage> conversationHistory, String currentMessage, String imageBase64, String mimeType) {
        String cleanKey = apiKey != null ? apiKey.trim() : "";
        String cleanModel = modelName != null ? modelName.trim() : "gemini-2.5-flash";

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + cleanModel + ":streamGenerateContent?alt=sse&key=" + cleanKey;

        Map<String, Object> requestBody = Map.of(
                "contents", buildContents(conversationHistory, currentMessage, imageBase64, mimeType)
        );

        return webClient.post()
                .uri(url)
                .header("x-goog-api-key", cleanKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(t -> t instanceof WebClientResponseException.ServiceUnavailable))
                .map(this::extractTextFromChunk)
                .filter(text -> !text.isEmpty());
    }

    private List<Map<String, Object>> buildContents(
            List<ChatMessage> conversationHistory,
            String currentMessage,
            String imageBase64,
            String mimeType
    ) {
        List<Map<String, Object>> contents = new ArrayList<>();

        // Past conversation messages (history)
        if (conversationHistory != null) {
            for (ChatMessage msg : conversationHistory) {
                String role = (msg.getSender() == SenderType.USER) ? "user" : "model";
                contents.add(Map.of(
                        "role", role,
                        "parts", List.of(Map.of("text", msg.getContent()))
                ));
            }
        }

        // Current turn parts
        List<Map<String, Object>> currentParts = new ArrayList<>();

        // Attach image part if present
        if (imageBase64 != null && !imageBase64.isBlank()) {
            String sanitizedBase64 = imageBase64.contains(",")
                    ? imageBase64.substring(imageBase64.indexOf(",") + 1)
                    : imageBase64;

            String resolvedMimeType = (mimeType != null && !mimeType.isBlank()) ? mimeType : "image/jpeg";

            currentParts.add(Map.of(
                    "inlineData", Map.of(
                            "mimeType", resolvedMimeType,
                            "data", sanitizedBase64
                    )
            ));
        }

        // Add text prompt
        currentParts.add(Map.of("text", currentMessage));

        contents.add(Map.of(
                "role", "user",
                "parts", currentParts
        ));

        return contents;
    }

    private String extractTextFromChunk(String rawChunk) {
        try {
            if (rawChunk == null) return "";
            String json = rawChunk.trim();
            if (json.startsWith("data:")) json = json.substring(5).trim();
            if (json.isEmpty() || json.equals("[DONE]")) return "";

            JsonNode root = objectMapper.readTree(json);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray()) {
                    StringBuilder chunkText = new StringBuilder();
                    for (JsonNode part : parts) {
                        if (part.path("thought").asBoolean(false)) continue;
                        chunkText.append(part.path("text").asText(""));
                    }
                    return chunkText.toString();
                }
            }
        } catch (Exception ignored) {}
        return "";
    }
}