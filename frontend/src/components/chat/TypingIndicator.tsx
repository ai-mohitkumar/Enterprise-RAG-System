/**
 * TypingIndicator component - Animated typing dots
 */

import React from "react";

interface TypingIndicatorProps {
  visible?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-1 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-100" />
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-200" />
      </div>
      <span className="text-sm text-secondary-500 dark:text-neutral-400 ml-2">
        Thinking...
      </span>
    </div>
  );
};

export default TypingIndicator;
