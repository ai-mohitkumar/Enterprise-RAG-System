/**
 * ChatInput component - Message input with file attachment
 */

import React, { useRef, useState } from "react";
import { Send, Paperclip, Loader } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  disabled = false,
  loading = false,
  placeholder = "Ask me anything...",
}) => {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || loading) return;

    onSubmit(input.trim(), files.length > 0 ? files : undefined);
    setInput("");
    setFiles([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t border-neutral-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-4">
      {/* File attachments */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-full text-sm"
            >
              <span className="text-primary-700 dark:text-primary-300 truncate max-w-[150px]">
                {file.name}
              </span>
              <button
                onClick={() => removeFile(idx)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-secondary-800 border border-neutral-200 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-neutral-100 placeholder-secondary-500 dark:placeholder-neutral-400 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 resize-none overflow-hidden max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Attach files"
        />

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
            className="p-2.5 hover:bg-neutral-100 dark:hover:bg-secondary-800 text-secondary-500 dark:text-neutral-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach files"
          >
            <Paperclip size={20} />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || disabled || loading}
            className="p-2.5 bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title="Send message"
          >
            {loading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-secondary-500 dark:text-neutral-400 mt-2">
        Ctrl+Enter to send
      </p>
    </div>
  );
};

export default ChatInput;
