package com.example.chatbot.dto;

public record AuthResponse(
        String token,
        String email,
        String name
) {}