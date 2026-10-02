package com.example.chatbot.dto;

import com.example.chatbot.model.SenderType;
import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        String content,
        SenderType sender,
        LocalDateTime timestamp
) {}