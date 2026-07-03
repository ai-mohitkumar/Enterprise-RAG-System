/**
 * Custom hook for document management
 */

import { useState, useCallback } from "react";
import { Document } from "@/types";
import documentService from "@services/documentService";

interface UseDocumentsOptions {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export const useDocuments = (options: UseDocumentsOptions = {}) => {
  const { onError, onSuccess } = options;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all documents
   */
  const fetchDocuments = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch documents";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  /**
   * Upload a single document
   */
  const uploadDocument = useCallback(
    async (file: File) => {
      // Validate file
        const validation = documentService.validateFile(file);
      if (!validation.valid) {
        const err = validation.error || "Invalid file";
        setError(err);
        onError?.(err);
        return null;
      }

      try {
        setError(null);
        setUploading(true);
        setUploadProgress(0);

        const response = await documentService.uploadDocument(file, (progress) => {
          setUploadProgress(progress);
        });

        // Add to documents list
        if (response.document_id) {
          const newDoc: Document = {
            id: response.document_id,
            filename: response.filename,
            size_bytes: response.size_bytes,
            document_type: file.name.split(".").pop()?.toLowerCase() || "unknown",
            upload_timestamp: new Date(response.timestamp),
            processing_status: "completed",
            user_id: response.user_id,
          };
          setDocuments((prev) => [newDoc, ...prev]);
        }

        onSuccess?.(`File "${file.name}" uploaded successfully`);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [onError, onSuccess]
  );

  /**
   * Upload multiple documents
   */
  const uploadMultiple = useCallback(
    async (files: File[]) => {
      // Validate all files
      for (const file of files) {
        const validation = documentService.validateFile(file);
        if (!validation.valid) {
          const err = validation.error || "Invalid file";
          setError(err);
          onError?.(err);
          return null;
        }
      }

      try {
        setError(null);
        setUploading(true);
        setUploadProgress(0);

        const responses = await documentService.uploadMultipleDocuments(
          files,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        // Add to documents list
        const newDocs: Document[] = responses
          .filter((r) => r.document_id)
          .map((r) => ({
            id: r.document_id!,
            filename: r.filename,
            size_bytes: r.size_bytes,
            document_type: r.filename.split(".").pop()?.toLowerCase() || "unknown",
            upload_timestamp: new Date(r.timestamp),
            processing_status: "completed" as const,
            user_id: r.user_id,
          }));

        setDocuments((prev) => [...newDocs, ...prev]);
        onSuccess?.(
          `${files.length} file(s) uploaded successfully`
        );
        return responses;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [onError, onSuccess]
  );

  /**
   * Delete a document
   */
  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await documentService.deleteDocument(id);
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        onSuccess?.("Document deleted successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Delete failed";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [onError, onSuccess]
  );

  /**
   * Delete multiple documents
   */
  const deleteMultiple = useCallback(
    async (ids: string[]) => {
      try {
        setError(null);
        await documentService.deleteMultipleDocuments(ids);
        setDocuments((prev) => prev.filter((doc) => !ids.includes(doc.id)));
        onSuccess?.(`${ids.length} document(s) deleted successfully`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Delete failed";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [onError, onSuccess]
  );

  /**
   * Clear all documents
   */
  const clearAll = useCallback(() => {
    setDocuments([]);
    setError(null);
  }, []);

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    error,
    fetchDocuments,
    uploadDocument,
    uploadMultiple,
    deleteDocument,
    deleteMultiple,
    clearAll,
  };
};

export default useDocuments;
