/**
 * DocumentList component - Display list of documents
 */

import React, { useEffect } from "react";
import { DocumentItem } from "./DocumentItem";
import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "../Common/Skeleton";
import { Document } from "@/types";

interface DocumentListProps {
  onDocumentDeleted?: (id: string) => void;
  onDocumentDownloaded?: (id: string) => void;
  refreshKey?: number;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onDocumentDeleted,
  onDocumentDownloaded,
  refreshKey = 0,
}) => {
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    deleteDocument,
  } = useDocuments();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deleteDocument(id);
      onDocumentDeleted?.(id);
    }
  };

  const handleDownload = (id: string) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      const link = document.createElement("a");
      link.href = `${apiBaseUrl}/documents/${id}/download`;
      link.download = doc.filename;
      link.click();
    }
    onDocumentDownloaded?.(id);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-48" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
          Error loading documents: {error}
        </p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-neutral-100 mb-2">
            No documents yet
          </h3>
          <p className="text-secondary-600 dark:text-neutral-400 text-sm">
            Upload documents to get started with document analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc: Document) => (
        <DocumentItem
          key={doc.id}
          document={doc}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
};

export default DocumentList;
