"use client";

import { useEffect, useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { CitationPanel } from "./CitationPanel";
import { useChat } from "@/hooks/useChat";
import { Message, Citation } from "@/types";

export function ChatInterface() {
  const { messages, loading, sendMessage } = useChat();
  const [citations, setCitations] = useState<Citation[]>([]);
  const [showCitations, setShowCitations] = useState(false);
  useEffect(() => {
    // MessageList auto-scrolls to bottom; keep effect in case future side-effects needed
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      const assistantMessage = await sendMessage(content);
      if (assistantMessage) {
        setCitations(assistantMessage.citations || []);
        setShowCitations((assistantMessage.citations || []).length > 0);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} loading={loading} />
        </div>
        <ChatInput onSubmit={handleSendMessage} disabled={loading} loading={loading} />
      </div>
      {showCitations && citations.length > 0 && (
        <CitationPanel citations={citations} onClose={() => setShowCitations(false)} />
      )}
    </div>
  );
}
