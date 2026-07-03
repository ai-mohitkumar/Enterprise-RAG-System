/**
 * Type definitions for chat, documents, and API
 */

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  confidence_score?: number;
  response_type?: "grounded" | "partial" | "uncertain" | "refused";
  hallucination_risk?: number;
  processing_time_ms?: number;
  sources?: string[];
}

export interface Citation {
  source: string;
  document_id: string;
  chunk_id: string;
  confidence: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
  document_ids?: string[];
}

export interface Document {
  id: string;
  filename: string;
  size_bytes: number;
  document_type: string;
  upload_timestamp: Date;
  processing_status: "pending" | "processing" | "completed" | "failed";
  chunk_count?: number;
  user_id?: string;
}

export interface QueryRequest {
  query: string;
  top_k?: number;
  user_id?: string;
}

export interface QueryResponse {
  query: string;
  response: string;
  response_type: "grounded" | "partial" | "uncertain" | "refused";
  confidence_score: number;
  citations: Citation[];
  sources: string[];
  processing_time_ms: number;
  model: string;
  timestamp: string;
  hallucination_risk: number;
}

export interface ApiError {
  error: string;
  status_code: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface UploadResponse {
  status: string;
  filename: string;
  size_bytes: number;
  user_id?: string;
  timestamp: string;
  document_id?: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  created_at: Date;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadProgress: number;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
