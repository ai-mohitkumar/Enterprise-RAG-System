# API Integration Guide

Complete documentation for integrating the frontend with the FastAPI backend.

## Backend API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Authentication
All requests include the auth token in the header:
```
Authorization: Bearer {token}
```

---

## Chat Endpoints

### 1. Send Query
**Endpoint:** `POST /query`

**Request:**
```json
{
  "query": "What are the main points in this document?",
  "conversation_id": "optional-uuid",
  "top_k": 5,
  "filters": {
    "document_ids": ["doc-1", "doc-2"]
  }
}
```

**Response (200 OK):**
```json
{
  "id": "msg-uuid",
  "query": "What are the main points?",
  "response": "The main points are...",
  "citations": [
    {
      "document_id": "doc-1",
      "document_name": "file.pdf",
      "page": 3,
      "snippet": "..."
    }
  ],
  "confidence": 0.95,
  "response_time_ms": 1250,
  "tokens_used": {
    "prompt": 150,
    "completion": 200
  }
}
```

**Error (400 Bad Request):**
```json
{
  "detail": "Invalid query",
  "error_code": "INVALID_QUERY"
}
```

### 2. Get Query History
**Endpoint:** `GET /history`

**Query Parameters:**
```
?limit=50&offset=0&conversation_id=optional-uuid
```

**Response (200 OK):**
```json
{
  "total": 150,
  "items": [
    {
      "id": "msg-uuid",
      "query": "What...",
      "response": "...",
      "created_at": "2024-01-15T10:30:00Z",
      "confidence": 0.92
    }
  ]
}
```

### 3. Get System Stats
**Endpoint:** `GET /stats`

**Response (200 OK):**
```json
{
  "total_documents": 25,
  "total_queries": 342,
  "average_confidence": 0.87,
  "uptime_hours": 168,
  "model_info": {
    "name": "gpt-4",
    "version": "1.0"
  }
}
```

### 4. Health Check
**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Document Endpoints

### 1. Upload Single Document
**Endpoint:** `POST /documents/upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
```
file: File
metadata: JSON (optional)
{
  "title": "Document Title",
  "description": "Optional description",
  "tags": ["tag1", "tag2"]
}
```

**Response (201 Created):**
```json
{
  "id": "doc-uuid",
  "name": "document.pdf",
  "size": 1024000,
  "status": "processing",
  "upload_time": "2024-01-15T10:30:00Z",
  "metadata": {
    "pages": null,
    "language": "en"
  }
}
```

**Progress Event (Streaming):**
```json
{
  "event": "progress",
  "progress": 45
}
```

### 2. Batch Upload
**Endpoint:** `POST /documents/batch-upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
```
files: File[] (multiple files)
```

**Response (201 Created):**
```json
{
  "uploaded": 3,
  "failed": 0,
  "results": [
    {
      "id": "doc-uuid-1",
      "name": "file1.pdf",
      "status": "processing"
    }
  ]
}
```

### 3. List Documents
**Endpoint:** `GET /documents`

**Query Parameters:**
```
?limit=20&offset=0&status=completed&tags=tag1,tag2
```

**Response (200 OK):**
```json
{
  "total": 25,
  "items": [
    {
      "id": "doc-uuid",
      "name": "document.pdf",
      "size": 1024000,
      "status": "completed",
      "upload_time": "2024-01-15T10:30:00Z",
      "pages": 12,
      "metadata": {
        "language": "en",
        "chunks": 45
      }
    }
  ]
}
```

### 4. Get Document Details
**Endpoint:** `GET /documents/{id}`

**Response (200 OK):**
```json
{
  "id": "doc-uuid",
  "name": "document.pdf",
  "size": 1024000,
  "status": "completed",
  "upload_time": "2024-01-15T10:30:00Z",
  "pages": 12,
  "chunks": 45,
  "metadata": {
    "language": "en",
    "extracted_text_preview": "First 500 chars...",
    "processing_time_ms": 5000
  }
}
```

### 5. Delete Document
**Endpoint:** `DELETE /documents/{id}`

**Response (204 No Content):**
```
Empty response
```

### 6. Batch Delete
**Endpoint:** `DELETE /documents`

**Request Body:**
```json
{
  "ids": ["doc-uuid-1", "doc-uuid-2"]
}
```

**Response (200 OK):**
```json
{
  "deleted": 2,
  "failed": 0
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Retry |
|------|---------|-------|
| 200 | Success | No |
| 201 | Created | No |
| 204 | No Content | No |
| 400 | Bad Request | No |
| 401 | Unauthorized | Yes (after refresh) |
| 403 | Forbidden | No |
| 404 | Not Found | No |
| 409 | Conflict | No |
| 429 | Rate Limited | Yes (with backoff) |
| 500 | Server Error | Yes (with exponential backoff) |
| 503 | Service Unavailable | Yes (with backoff) |

### Error Response Format

```json
{
  "detail": "Human-readable error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req-uuid"
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_QUERY` | Query validation failed | Check query format |
| `INVALID_FILE_TYPE` | File type not supported | Use PDF, TXT, DOCX |
| `FILE_TOO_LARGE` | File exceeds size limit | Max 50MB per file |
| `DOCUMENT_NOT_FOUND` | Document doesn't exist | Check document ID |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retrying |
| `AUTHENTICATION_FAILED` | Invalid/expired token | Refresh authentication |
| `INTERNAL_SERVER_ERROR` | Server error | Retry with backoff |

---

## Frontend Implementation

### Chat Service Example

```typescript
// src/services/chatService.ts
import { apiClient } from '@/lib/api';
import { QueryRequest, QueryResponse } from '@/types';

export const chatService = {
  async sendQuery(request: QueryRequest): Promise<QueryResponse> {
    const response = await apiClient.post<QueryResponse>(
      '/query',
      request
    );
    return response.data;
  },

  async getHistory(
    limit = 50,
    offset = 0,
    conversationId?: string
  ) {
    const response = await apiClient.get('/history', {
      params: { limit, offset, conversation_id: conversationId },
    });
    return response.data;
  },

  async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
```

### Document Service Example

```typescript
// src/services/documentService.ts
import { apiClient } from '@/lib/api';
import { Document } from '@/types';

export const documentService = {
  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Document>(
      '/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            onProgress?.(progress);
          }
        },
      }
    );
    return response.data;
  },

  async getDocuments(limit = 20, offset = 0) {
    const response = await apiClient.get<{ items: Document[] }>(
      '/documents',
      {
        params: { limit, offset },
      }
    );
    return response.data.items;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};
```

---

## Rate Limiting

### Limits
- 100 requests per minute per user
- 10 file uploads per hour
- 100 concurrent queries per user

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705314600
```

### Handling Rate Limits
```typescript
if (error.response?.status === 429) {
  const resetTime = error.response.headers['x-ratelimit-reset'];
  const waitTime = resetTime - Date.now();
  // Implement exponential backoff
  setTimeout(() => retryRequest(), waitTime);
}
```

---

## Authentication

### Token Refresh Flow

```typescript
// Request with token
const response = await apiClient.get('/query');

// If 401 Unauthorized
if (response.status === 401) {
  // Refresh token
  const newToken = await refreshAuthToken();
  
  // Retry request with new token
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  const retryResponse = await apiClient.get('/query');
}
```

---

## WebSocket Connection (Optional)

For real-time query responses:

```typescript
const socket = new WebSocket('ws://localhost:8000/ws/chat');

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'response_chunk') {
    // Streaming response
    handleResponseChunk(message.data);
  } else if (message.type === 'response_complete') {
    // Response finished
    handleResponseComplete(message.data);
  }
};
```

---

## Testing the API

### Using cURL

```bash
# Send query
curl -X POST http://localhost:8000/api/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"What is this about?"}'

# Upload document
curl -X POST http://localhost:8000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"

# List documents
curl -X GET http://localhost:8000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import collection: `RAG_API.postman_collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:8000`
   - `token`: Your auth token
3. Run requests

### Using Frontend

```typescript
import { chatService } from '@/services/chatService';
import { documentService } from '@/services/documentService';

// Test chat
const response = await chatService.sendQuery({
  query: 'Test query',
});

// Test documents
const docs = await documentService.getDocuments();
```

---

## Performance Considerations

### Pagination
- Use `limit` and `offset` for large result sets
- Recommended limit: 20-50 items
- Backend supports max limit: 1000

### Caching
- GET requests are cached for 5 minutes
- Bypass cache: Add `Cache-Control: no-cache` header
- Use `If-Modified-Since` for conditional requests

### Timeouts
- Default: 30 seconds
- Large file uploads: 5 minutes
- Configure in `.env`:
  ```
  NEXT_PUBLIC_API_TIMEOUT=30000
  ```

---

## Deployment

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_API_TIMEOUT=30000
NODE_ENV=production
```

### CORS Configuration

Frontend and backend should have matching CORS:
```python
# Backend (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

**Version**: 1.0.0  
**Last Updated**: 2024
