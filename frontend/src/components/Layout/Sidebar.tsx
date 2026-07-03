/**
 * Sidebar component
 */

import React from "react";
import { Plus, FileText, MessageSquare, ChevronRight } from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  mobile = false,
}) => {
  const [conversations, setConversations] = React.useState([
    { id: 1, title: "RAG System Overview", date: "Today" },
    { id: 2, title: "Document Analysis", date: "Yesterday" },
    { id: 3, title: "Query Optimization", date: "2 days ago" },
  ]);

  return (
    <aside
      className={`h-full bg-white dark:bg-secondary-800 border-r border-neutral-200 dark:border-secondary-700 flex flex-col transition-all ${
        mobile ? "shadow-lg" : ""
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-secondary-700">
        <button className="w-full flex items-center gap-3 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg text-primary-600 dark:text-primary-400 font-medium transition-colors">
          <Plus size={20} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4 space-y-2">
          <div className="px-2 py-2">
            <h3 className="text-xs font-semibold text-secondary-500 dark:text-neutral-400 uppercase tracking-wider">
              {!collapsed && "Recent"}
            </h3>
          </div>

          {conversations.map((conv) => (
            <button
              key={conv.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-secondary-700 rounded-lg transition-colors group"
              title={conv.title}
            >
              <MessageSquare
                size={18}
                className="text-secondary-400 dark:text-neutral-500 flex-shrink-0"
              />
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 dark:text-neutral-200 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-neutral-500">
                      {conv.date}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-secondary-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100"
                  />
                </>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 dark:border-secondary-700">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-secondary-600 dark:text-neutral-400 hover:text-secondary-900 dark:hover:text-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-secondary-700 transition-colors">
          <FileText size={18} />
          {!collapsed && <span>Upload Files</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      {onToggle && !mobile && (
        <div className="p-2 border-t border-neutral-200 dark:border-secondary-700">
          <button
            onClick={onToggle}
            className="w-full p-2 hover:bg-neutral-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              size={18}
              className={`mx-auto text-secondary-500 dark:text-neutral-500 transition-transform ${
                collapsed ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
