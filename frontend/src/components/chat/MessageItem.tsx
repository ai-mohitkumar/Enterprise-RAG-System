/**
 * MessageItem component - Individual chat message
 */

import React from "react";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  isLast?: boolean;
  onCopy?: (content: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast,
  onCopy,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [helpful, setHelpful] = React.useState<boolean | null>(null);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
    } else {
      navigator.clipboard.writeText(message.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 py-4 px-4 sm:px-6 ${
        isUser
          ? "bg-neutral-50 dark:bg-secondary-800/50"
          : "bg-white dark:bg-secondary-900"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isUser
              ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
              : "bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-neutral-300"
          }`}
        >
          {isUser ? "U" : "AI"}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-secondary-900 dark:text-neutral-100 mb-2">
          {isUser ? "You" : "Assistant"}
        </p>

        {/* Message text */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
          <p className="text-secondary-700 dark:text-neutral-300 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mb-3 pt-3 border-t border-neutral-200 dark:border-secondary-700">
            <p className="text-xs font-semibold text-secondary-500 dark:text-neutral-400 mb-2">
              Sources:
            </p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation, idx) => (
                <a
                  key={idx}
                  href={citation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-secondary-700 hover:bg-neutral-200 dark:hover:bg-secondary-600 rounded text-xs text-primary-600 dark:text-primary-400 transition-colors truncate"
                  title={citation}
                >
                  📄 {citation.split("/").pop()?.slice(0, 20)}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Confidence score */}
        {message.confidence && !isUser && (
          <div className="flex items-center gap-2 mb-3 text-xs text-secondary-500 dark:text-neutral-400">
            <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-secondary-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  message.confidence > 0.8
                    ? "bg-green-500"
                    : message.confidence > 0.6
                      ? "bg-yellow-500"
                      : "bg-orange-500"
                }`}
                style={{ width: `${message.confidence * 100}%` }}
              />
            </div>
            <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Actions */}
        {!isUser && isLast && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-secondary-700">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-secondary-800 rounded transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} className="text-secondary-500 dark:text-neutral-400" />
              )}
            </button>

            <button
              onClick={() => setHelpful(true)}
              className={`p-2 rounded transition-colors ${
                helpful === true
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "hover:bg-neutral-100 dark:hover:bg-secondary-800"
              }`}
              title="Helpful"
            >
              <ThumbsUp
                size={16}
                className={
                  helpful === true
                    ? "text-green-600"
                    : "text-secondary-500 dark:text-neutral-400"
                }
              />
            </button>

            <button
              onClick={() => setHelpful(false)}
              className={`p-2 rounded transition-colors ${
                helpful === false
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "hover:bg-neutral-100 dark:hover:bg-secondary-800"
              }`}
              title="Not helpful"
            >
              <ThumbsDown
                size={16}
                className={
                  helpful === false
                    ? "text-red-600"
                    : "text-secondary-500 dark:text-neutral-400"
                }
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
