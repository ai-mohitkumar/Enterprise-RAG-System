/**
 * Card component - Reusable container for grouped content
 */

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-secondary-800
        border border-neutral-200 dark:border-secondary-700
        rounded-lg
        shadow-sm hover:shadow-md
        transition-shadow
        ${hoverable ? "cursor-pointer hover:border-primary-300 dark:hover:border-primary-600" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
