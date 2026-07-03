/**
 * Chat service - handles all chat API calls
 */

import apiClient, { ApiErrorHandler } from "@lib/api";
import { Message, QueryRequest, QueryResponse } from "@/types";

export const chatService = {
  /**
   * Send a query to the RAG system
   */
  async sendQuery(request: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await apiClient.post<QueryResponse>("/query", request);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Send multiple queries in batch
   */
  async batchQueries(queries: QueryRequest[]): Promise<QueryResponse[]> {
    try {
      const response = await apiClient.post<{ results: QueryResponse[] }>(
        "/batch-query",
        queries
      );
      return response.data.results;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Get query history
   */
  async getQueryHistory(
    limit: number = 10,
    userId?: string
  ): Promise<QueryResponse[]> {
    try {
      const response = await apiClient.get<{ queries: QueryResponse[] }>(
        "/analytics/query-history",
        {
          params: { limit, user_id: userId },
        }
      );
      return response.data.queries || [];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Get system statistics
   */
  async getStats() {
    try {
      const response = await apiClient.get("/analytics/stats");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      const response = await apiClient.get("/health");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Convert QueryResponse to Message format
   */
  convertToMessage(response: QueryResponse, id: string = ""): Message {
    return {
      id: id || `msg_${Date.now()}`,
      role: "assistant",
      content: response.response,
      timestamp: new Date(response.timestamp),
      citations: response.citations,
      confidence_score: response.confidence_score,
      response_type: response.response_type,
      hallucination_risk: response.hallucination_risk,
      processing_time_ms: response.processing_time_ms,
      sources: response.sources,
    };
  },

  /**
   * Format message for display (add markdown formatting)
   */
  formatMessageContent(content: string): string {
    // Add markdown formatting if needed
    return content;
  },
};

export default chatService;
