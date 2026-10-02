package com.example.chatbot.service;

import com.example.chatbot.dto.ChatMessageRequest;
import com.example.chatbot.dto.ChatMessageResponse;
import com.example.chatbot.dto.ConversationResponse;
import com.example.chatbot.model.ChatMessage;
import com.example.chatbot.model.Conversation;
import com.example.chatbot.model.SenderType;
import com.example.chatbot.model.User;
import com.example.chatbot.repository.ChatMessageRepository;
import com.example.chatbot.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final BotService botService;

    @Transactional
    public ChatMessageResponse sendMessage(User user, ChatMessageRequest request) {
        Conversation conversation = getOrCreateConversation(user, request);

        List<ChatMessage> existingHistory = chatMessageRepository
                .findByConversationIdOrderByTimestampAsc(conversation.getId());

        // 1. Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .conversation(conversation)
                .content(request.message())
                .sender(SenderType.USER)
                .build();
        chatMessageRepository.save(userMsg);

        // 2. Call Gemini (with optional image)
        String botReplyText = botService.generateBotReply(
                existingHistory,
                request.message(),
                request.imageBase64(),
                request.imageMimeType()
        );

        // 3. Save Bot Message
        ChatMessage botMsg = ChatMessage.builder()
                .conversation(conversation)
                .content(botReplyText)
                .sender(SenderType.BOT)
                .build();
        ChatMessage savedBotMsg = chatMessageRepository.save(botMsg);

        return new ChatMessageResponse(
                savedBotMsg.getId(),
                savedBotMsg.getContent(),
                savedBotMsg.getSender(),
                savedBotMsg.getTimestamp()
        );
    }

    @Transactional
    public Flux<String> streamMessage(User user, ChatMessageRequest request) {
        final Conversation conversation = getOrCreateConversation(user, request);

        List<ChatMessage> history = chatMessageRepository
                .findByConversationIdOrderByTimestampAsc(conversation.getId());

        // Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .conversation(conversation)
                .content(request.message())
                .sender(SenderType.USER)
                .build();
        chatMessageRepository.save(userMsg);

        StringBuilder fullBotReply = new StringBuilder();
        Long conversationId = conversation.getId();

        return botService.streamBotReply(
                        history,
                        request.message(),
                        request.imageBase64(),
                        request.imageMimeType()
                )
                .doOnNext(fullBotReply::append)
                .doOnComplete(() -> {
                    if (!fullBotReply.isEmpty()) {
                        saveBotMessage(conversationId, fullBotReply.toString());
                    }
                });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveBotMessage(Long conversationId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        ChatMessage botMsg = ChatMessage.builder()
                .conversation(conversation)
                .content(content)
                .sender(SenderType.BOT)
                .build();
        chatMessageRepository.save(botMsg);
    }

    @Transactional
    public void deleteConversation(User user, Long conversationId) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        conversationRepository.delete(conversation);
    }

    public List<ConversationResponse> getUserConversations(User user) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(c -> new ConversationResponse(c.getId(), c.getTitle(), c.getCreatedAt()))
                .toList();
    }

    public List<ChatMessageResponse> getConversationMessages(User user, Long conversationId) {
        conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        return chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId)
                .stream()
                .map(m -> new ChatMessageResponse(m.getId(), m.getContent(), m.getSender(), m.getTimestamp()))
                .toList();
    }

    private Conversation getOrCreateConversation(User user, ChatMessageRequest request) {
        if (request.conversationId() != null) {
            return conversationRepository.findByIdAndUserId(request.conversationId(), user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        }

        String summaryTitle = request.message().length() > 30
                ? request.message().substring(0, 30) + "..."
                : request.message();

        return conversationRepository.save(
                Conversation.builder()
                        .title(summaryTitle)
                        .user(user)
                        .build()
        );
    }
}