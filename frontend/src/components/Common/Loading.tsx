/**
 * Loading component - Full-screen or inline loading spinner
 */

import React from "react";

interface LoadingProps {
  fullscreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const Loading: React.FC<LoadingProps> = ({
  fullscreen = false,
  message = "Loading...",
  size = "md",
}) => {
  const spinnerSize =
    size === "sm" ? "w-6 h-6" : size === "lg" ? "w-12 h-12" : "w-8 h-8";

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className={`${spinnerSize} border-3 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`} />
      {message && (
        <p className="text-secondary-600 dark:text-neutral-400 font-medium">
          {message}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-secondary-900 rounded-lg p-8 shadow-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
};

export default Loading;
