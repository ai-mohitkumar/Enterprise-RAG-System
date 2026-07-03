/**
 * DocumentItem component - Individual document card
 */

import React, { useState } from "react";
import { FileText, Download, Trash2, MoreVertical } from "lucide-react";
import { Document } from "@/types";
import { Badge } from "../Common/Badge";

interface DocumentItemProps {
  document: Document;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  onDelete,
  onDownload,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const status = document.processing_status;

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "warning";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      default:
        return "neutral";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 bg-white dark:bg-secondary-800 border border-neutral-200 dark:border-secondary-700 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-secondary-900 dark:text-neutral-100 truncate">
              {document.filename}
            </h3>
            <p className="text-xs text-secondary-500 dark:text-neutral-500">
              {formatSize(document.size_bytes)} • {formatDate(String(document.upload_timestamp))}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-secondary-700 rounded-lg transition-colors text-secondary-500 dark:text-neutral-400"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-secondary-700 border border-neutral-200 dark:border-secondary-600 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onDownload?.(document.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-secondary-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-secondary-600 flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => {
                  onDelete?.(document.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant={getStatusColor()} size="sm">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        <p className="text-xs text-secondary-500 dark:text-neutral-500 uppercase">
          {document.document_type}
        </p>
      </div>
    </div>
  );
};

export default DocumentItem;
