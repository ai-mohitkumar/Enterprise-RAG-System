'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { CitationPanel } from './CitationPanel';
import { useChat } from '@/lib/hooks/useChat';
import { Message, Citation } from '@/types';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [showCitations, setShowCitations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        citations: response.citations,
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCitations(response.citations);
      setShowCitations(true);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
        </div>
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
      {showCitations && citations.length > 0 && (
        <CitationPanel
          citations={citations}
          onClose={() => setShowCitations(false)}
        />
      )}
    </div>
  );
}
