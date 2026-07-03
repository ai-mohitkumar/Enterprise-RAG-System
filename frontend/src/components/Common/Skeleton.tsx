/**
 * Skeleton component - Loading placeholder
 */

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect";
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rect",
  count = 1,
}) => {
  const baseClass = "bg-neutral-200 dark:bg-secondary-700 animate-pulse";

  const getVariantClass = () => {
    switch (variant) {
      case "circle":
        return "rounded-full w-10 h-10";
      case "text":
        return "rounded h-4 w-full";
      default:
        return "rounded h-24 w-full";
    }
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${getVariantClass()} ${className}`}
          />
        ))}
      </div>
    );
  }

  return <div className={`${baseClass} ${getVariantClass()} ${className}`} />;
};

export default Skeleton;
