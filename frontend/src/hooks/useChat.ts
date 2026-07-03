/**
 * Custom hook for chat functionality
 */

import { useState, useCallback, useRef } from "react";
import { Message, Conversation } from "@/types";
import chatService from "@services/chatService";
import documentService from "@services/documentService";

interface UseChatOptions {
  onError?: (error: string) => void;
  onSuccess?: (message: Message) => void;
  userId?: string;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { onError, onSuccess, userId } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Send a message and get response
   */
  const sendMessage = useCallback(
    async (query: string, files?: File[]) => {
      // Validate input
      if (!query.trim()) {
        const err = "Query cannot be empty";
        setError(err);
        onError?.(err);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        // Add user message immediately
        const userMessage: Message = {
          id: `msg_${Date.now()}`,
          role: "user",
          content: query,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        if (files && files.length > 0) {
          if (files.length === 1) {
            await documentService.uploadDocument(files[0]);
          } else {
            await documentService.uploadMultipleDocuments(files);
          }
        }

        // Send to API
        const response = await chatService.sendQuery({
          query,
          user_id: userId,
          top_k: 5,
        });

        // Convert response to message
        const assistantMessage = chatService.convertToMessage(response);
        setMessages((prev) => [...prev, assistantMessage]);

        onSuccess?.(assistantMessage);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        onError?.(errorMessage);

        // Remove user message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [onError, onSuccess, userId]
  );

  /**
   * Send batch of messages
   */
  const sendBatch = useCallback(
    async (queries: string[]) => {
      try {
        setError(null);
        setLoading(true);

        const responses = await chatService.batchQueries(
          queries.map((q) => ({
            query: q,
            user_id: userId,
          }))
        );

        const newMessages: Message[] = [];
        responses.forEach((response) => {
          const message = chatService.convertToMessage(response);
          newMessages.push(message);
        });

        setMessages((prev) => [...prev, ...newMessages]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send batch";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onError, userId]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Remove a single message
   */
  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  /**
   * Edit a message
   */
  const editMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      )
    );
  }, []);

  /**
   * Retry last message
   */
  const retry = useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");

    if (!lastUserMessage) return;

    // Remove last assistant message if exists
    const lastAssistantIndex = messages.findIndex(
      (msg) =>
        msg.role === "assistant" &&
        msg.timestamp > lastUserMessage.timestamp
    );

    if (lastAssistantIndex !== -1) {
      setMessages((prev) => prev.slice(0, lastAssistantIndex));
    }

    // Resend message
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  /**
   * Save conversation to localStorage
   */
  const saveToStorage = useCallback((conversationId: string) => {
    const conversation: Conversation = {
      id: conversationId,
      title: messages[0]?.content.substring(0, 50) || "New Conversation",
      messages,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const stored = localStorage.getItem("conversations");
    const conversations = stored ? JSON.parse(stored) : [];
    const index = conversations.findIndex((c: Conversation) => c.id === conversationId);

    if (index !== -1) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }

    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [messages]);

  /**
   * Load conversation from localStorage
   */
  const loadFromStorage = useCallback((conversationId: string) => {
    const stored = localStorage.getItem("conversations");
    if (!stored) return false;

    const conversations: Conversation[] = JSON.parse(stored);
    const conversation = conversations.find((c) => c.id === conversationId);

    if (conversation) {
      setMessages(conversation.messages);
      return true;
    }
    return false;
  }, []);

  /**
   * Cancel ongoing request
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendBatch,
    clearMessages,
    removeMessage,
    editMessage,
    retry,
    saveToStorage,
    loadFromStorage,
    cancel,
  };
};

export default useChat;
