/**
 * ChatContainer component - Main chat interface
 */

import React, { useCallback, useEffect } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";

interface ChatContainerProps {
  conversationId?: string;
  onError?: (error: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  conversationId,
  onError,
}) => {
  const {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    retry,
  } = useChat();

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Load conversation if ID provided
  useEffect(() => {
    if (conversationId) {
      // In a real app, fetch conversation by ID
      clearMessages();
    }
  }, [conversationId, clearMessages]);

  const handleSendMessage = useCallback(
    async (message: string, files?: File[]) => {
      try {
        await sendMessage(message, files);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [sendMessage]
  );

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).catch((err) => {
      console.error("Failed to copy:", err);
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-secondary-900">
      {/* Messages */}
      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        onCopyMessage={handleCopyMessage}
      />

      {/* Input */}
      <ChatInput
        onSubmit={handleSendMessage}
        disabled={false}
        loading={loading}
      />
    </div>
  );
};

export default ChatContainer;
