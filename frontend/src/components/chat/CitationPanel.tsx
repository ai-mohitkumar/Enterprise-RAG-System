import React from "react";
import { X, ExternalLink } from "lucide-react";
import { Citation } from "@/types";

interface CitationPanelProps {
  citations: Citation[];
  onClose: () => void;
}

export const CitationPanel: React.FC<CitationPanelProps> = ({
  citations,
  onClose,
}) => {
  return (
    <aside className="w-80 border-l border-neutral-200 dark:border-secondary-700 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-secondary-700 bg-neutral-50 dark:bg-secondary-900">
        <div>
          <p className="text-sm font-semibold">Citations</p>
          <p className="text-xs text-secondary-500 dark:text-neutral-400">Sources used by the assistant</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-secondary-800 transition-colors"
          aria-label="Close citations panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-full">
        {citations.map((citation, index) => (
          <div
            key={`${citation.document_id}-${citation.chunk_id}-${index}`}
            className="rounded-lg border border-neutral-200 dark:border-secondary-700 bg-neutral-50 dark:bg-secondary-900 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-secondary-500 dark:text-neutral-500">
                  Document
                </p>
                <p className="text-sm font-medium text-secondary-900 dark:text-neutral-100 truncate">
                  {citation.document_id}
                </p>
              </div>
              <span className="text-xs text-secondary-500 dark:text-neutral-400">
                {Math.round(citation.confidence * 100)}%
              </span>
            </div>

            <div className="mt-3 text-sm text-secondary-600 dark:text-neutral-300 space-y-1">
              <p>
                <span className="font-semibold">Chunk:</span> {citation.chunk_id}
              </p>
              {citation.source && (
                <a
                  href={citation.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View source
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CitationPanel;
