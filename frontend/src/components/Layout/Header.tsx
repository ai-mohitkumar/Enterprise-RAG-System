/**
 * Header component
 */

import React from "react";
import { Menu, X, Settings, LogOut } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  return (
    <header className="h-16 border-b border-neutral-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex items-center justify-between px-4 md:px-6">
      {/* Left side - Menu & Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X size={20} className="text-secondary-700 dark:text-neutral-300" />
          ) : (
            <Menu size={20} className="text-secondary-700 dark:text-neutral-300" />
          )}
        </button>

        <h1 className="text-lg font-semibold text-secondary-900 dark:text-white hidden md:block">
          AI Assistant
        </h1>
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-neutral-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings
            size={20}
            className="text-secondary-700 dark:text-neutral-300"
          />
        </button>

        <button
          className="p-2 hover:bg-neutral-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <LogOut
            size={20}
            className="text-secondary-700 dark:text-neutral-300"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
