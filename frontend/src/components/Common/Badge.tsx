/**
 * Badge component - Label/tag component
 */

import React from "react";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200",
  success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  neutral:
    "bg-neutral-100 dark:bg-secondary-700 text-secondary-800 dark:text-neutral-200",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
}) => {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`
        inline-flex items-center
        font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClass}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
