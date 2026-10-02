package com.example.chatbot.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        Long conversationId,
        @NotBlank String message,
        String imageBase64,
        String imageMimeType
) {}