"use client";

/**
 * Main layout wrapper
 */

import React, { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-secondary-900">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "w-0 md:w-20" : "w-64"
        } hidden md:block border-r border-neutral-200 dark:border-secondary-700`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 z-30 md:hidden transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setSidebarOpen(false)}
          mobile
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto bg-white dark:bg-secondary-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
