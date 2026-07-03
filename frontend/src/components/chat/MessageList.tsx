/**
 * MessageList component - Scrollable list of messages
 */

import React, { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  error?: string | null;
  onCopyMessage?: (content: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading = false,
  error = null,
  onCopyMessage,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-neutral-100 mb-2">
            Start a conversation
          </h2>
          <p className="text-secondary-600 dark:text-neutral-400 mb-6">
            Ask questions about your documents or request analysis
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            {[
              "Summarize the document",
              "Key findings",
              "Compare documents",
              "Extract entities",
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="p-3 text-left text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto flex flex-col divide-y divide-neutral-200 dark:divide-secondary-700"
    >
      {error && (
        <div className="mx-4 my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Error: {error}
          </p>
        </div>
      )}

      {messages.map((message, idx) => (
        <MessageItem
          key={message.id || idx}
          message={message}
          isLast={idx === messages.length - 1 && !loading}
          onCopy={onCopyMessage}
        />
      ))}

      {loading && <TypingIndicator />}

      <div ref={endRef} className="py-2" />
    </div>
  );
};

export default MessageList;
