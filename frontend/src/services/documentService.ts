/**
 * Document service - handles all document API calls
 */

import apiClient, { ApiErrorHandler } from "@lib/api";
import { Document, UploadResponse } from "@/types";

export const documentService = {
  /**
   * Upload a document
   */
  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<UploadResponse>(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              onProgress(progress);
            }
          },
        }
      );

      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Upload multiple documents
   */
  async uploadMultipleDocuments(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await apiClient.post<{ results: UploadResponse[] }>(
        "/documents/upload-batch",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              onProgress(progress);
            }
          },
        }
      );

      return response.data.results || [];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Get all documents
   */
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await apiClient.get<{
        documents: Document[];
        count: number;
      }>("/documents");
      return response.data.documents || [];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<Document> {
    try {
      const response = await apiClient.get<Document>(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await apiClient.delete(`/documents/${id}`);
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Delete multiple documents
   */
  async deleteMultipleDocuments(ids: string[]): Promise<void> {
    try {
      await apiClient.post("/documents/delete-batch", { ids });
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "File type not supported. Supported types: PDF, DOCX, TXT, MD",
      };
    }

    return { valid: true };
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },

  /**
   * Get status badge text
   */
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: "Queued",
      processing: "Processing",
      completed: "Ready",
      failed: "Error",
    };
    return statusMap[status] || status;
  },

  /**
   * Get status color
   */
  getStatusColor(
    status: string
  ): "success" | "warning" | "error" | "info" {
    const colorMap: Record<string, "success" | "warning" | "error" | "info"> = {
      pending: "info",
      processing: "warning",
      completed: "success",
      failed: "error",
    };
    return colorMap[status] || "info";
  },
};

export default documentService;
