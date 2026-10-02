package com.example.chatbot.controller;

import com.example.chatbot.dto.ChatMessageRequest;
import com.example.chatbot.dto.ChatMessageResponse;
import com.example.chatbot.dto.ConversationResponse;
import com.example.chatbot.model.User;
import com.example.chatbot.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // Standard synchronous message response
    @PostMapping("/send")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        return ResponseEntity.ok(chatService.sendMessage(user, request));
    }

    // SSE Streaming response
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        return chatService.streamMessage(user, request);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(chatService.getUserConversations(user));
    }
    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        chatService.deleteConversation(user, id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(chatService.getConversationMessages(user, id));
    }


}