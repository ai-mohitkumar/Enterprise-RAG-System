/**
 * Tabs component - Tab navigation
 */

import React, { createContext, useContext } from "react";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`flex gap-0 ${className}`} role="tablist">
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const { value: activeValue, onValueChange } = context;
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
        isActive
          ? "text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400"
          : "text-secondary-600 dark:text-neutral-400 border-transparent hover:text-secondary-900 dark:hover:text-neutral-200"
      }`}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const { value: activeValue } = context;

  if (activeValue !== value) return null;

  return <div className={className}>{children}</div>;
};

export default Tabs;
