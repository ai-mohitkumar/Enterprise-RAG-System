# Production RAG System - Configuration & Implementation Examples

## Database Schema (PostgreSQL)

```sql
-- Metadata store for documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_hash VARCHAR(64) UNIQUE,
    document_type VARCHAR(50),
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_status VARCHAR(50) DEFAULT 'pending',
    chunk_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(processing_status);

-- Chunk metadata (one row per text chunk)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    content_length INT,
    embedding_vector_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, chunk_index)
);

CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_chunks_vector_id ON document_chunks(embedding_vector_id);

-- Query audit log
CREATE TABLE query_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    query TEXT NOT NULL,
    response TEXT,
    response_type VARCHAR(50),
    confidence_score FLOAT,
    processing_time_ms INT,
    model_used VARCHAR(100),
    hallucination_risk FLOAT,
    tokens_used INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    session_id VARCHAR(255)
);

CREATE INDEX idx_audit_user ON query_audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON query_audit_log(timestamp);
CREATE INDEX idx_audit_type ON query_audit_log(response_type);

-- User profiles and access control
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'user',
    organization_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_documents_access (
    user_id VARCHAR(255) REFERENCES users(id),
    document_id UUID REFERENCES documents(id),
    access_level VARCHAR(50) DEFAULT 'read',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, document_id)
);

-- Session/cache metadata
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    session_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_activity TIMESTAMP
);
```

---

## Vector Database Schema (Pinecone)

```json
{
  "namespace": "documents",
  "vectors": [
    {
      "id": "doc_001_chunk_000",
      "values": [0.123, 0.456, ..., 0.789],
      "metadata": {
        "document_id": "doc_001",
        "chunk_id": "chunk_000",
        "filename": "company_handbook.pdf",
        "chunk_index": 0,
        "content_preview": "This company was founded in...",
        "similarity_score": 0.95,
        "upload_timestamp": 1705945445,
        "user_id": "user_123"
      }
    }
  ]
}
```

---

## Redis Cache Configuration

```python
# Cache key structures
CACHE_KEYS = {
    "query_result": "rag:query:{query_hash}",          # TTL: 1 hour
    "user_session": "rag:session:{user_id}:{session_id}", # TTL: 24 hours
    "embedding": "rag:embedding:{text_hash}",          # TTL: 7 days
    "document_status": "rag:doc:status:{doc_id}",      # TTL: Until processed
    "rate_limit": "rag:ratelimit:{user_id}",           # TTL: 60 seconds
    "hallucination_alerts": "rag:alerts:hallucination", # TTL: 24 hours
}

# Example Redis operations
redis_client.setex(
    f"rag:query:{query_hash}",
    3600,  # 1 hour TTL
    json.dumps(response)
)

# Query results
cached_result = redis_client.get(f"rag:query:{query_hash}")
```

---

## API Request/Response Examples

### Query Endpoint

**Request:**
```bash
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user_123" \
  -d '{
    "query": "What are the key responsibilities of the Product Manager role?",
    "top_k": 5,
    "user_id": "user_123"
  }'
```

**Response:**
```json
{
  "query": "What are the key responsibilities of the Product Manager role?",
  "response": "Based on the company handbook [source: handbook.pdf], the Product Manager role has the following key responsibilities:\n\n1. Define product roadmap and strategy [source: handbook.pdf, chunk 15]\n2. Collaborate with engineering and design teams [source: handbook.pdf, chunk 16]\n3. Analyze market trends and user feedback [source: handbook.pdf, chunk 17]\n\n⚠️ Note: For detailed responsibilities, please refer to the full job description.",
  "response_type": "grounded",
  "confidence_score": 0.92,
  "citations": [
    {
      "source": "handbook.pdf",
      "document_id": "doc_001",
      "chunk_id": "chunk_015",
      "confidence": 0.95
    },
    {
      "source": "handbook.pdf",
      "document_id": "doc_001",
      "chunk_id": "chunk_016",
      "confidence": 0.93
    }
  ],
  "sources": ["handbook.pdf"],
  "processing_time_ms": 1243,
  "model": "gpt-3.5-turbo",
  "timestamp": "2024-01-22T14:30:45.123Z",
  "hallucination_risk": 0.08
}
```

### Batch Query Endpoint

**Request:**
```bash
curl -X POST http://localhost:8080/batch-query \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [
      {"query": "What is the vacation policy?", "top_k": 3},
      {"query": "How do I request equipment?", "top_k": 3},
      {"query": "What is the remote work policy?", "top_k": 3}
    ]
  }'
```

**Response:**
```json
{
  "results": [
    {
      "query": "What is the vacation policy?",
      "response": "...",
      "response_type": "grounded",
      "confidence_score": 0.89,
      "citations": [...],
      "sources": ["employee_handbook.pdf"],
      "processing_time_ms": 1100,
      "model": "gpt-3.5-turbo",
      "timestamp": "2024-01-22T14:30:45.123Z",
      "hallucination_risk": 0.05
    },
    {
      "query": "How do I request equipment?",
      "response": "...",
      "response_type": "grounded",
      "confidence_score": 0.91,
      "citations": [...],
      "sources": ["it_procedures.pdf"],
      "processing_time_ms": 950,
      "model": "gpt-3.5-turbo",
      "timestamp": "2024-01-22T14:30:46.234Z",
      "hallucination_risk": 0.03
    },
    {
      "query": "What is the remote work policy?",
      "response": "...",
      "response_type": "grounded",
      "confidence_score": 0.88,
      "citations": [...],
      "sources": ["work_policy.pdf"],
      "processing_time_ms": 1050,
      "model": "gpt-3.5-turbo",
      "timestamp": "2024-01-22T14:30:47.456Z",
      "hallucination_risk": 0.06
    }
  ],
  "count": 3
}
```

### Document Upload Endpoint

**Request:**
```bash
curl -X POST http://localhost:8080/documents/upload \
  -H "X-User-ID: user_123" \
  -F "file=@employee_handbook.pdf"
```

**Response:**
```json
{
  "status": "uploaded",
  "filename": "employee_handbook.pdf",
  "size_bytes": 2453689,
  "user_id": "user_123",
  "timestamp": "2024-01-22T14:30:48.000Z",
  "message": "Document will be processed in background",
  "document_id": "doc_042"
}
```

---

## Monitoring Alerts Configuration

### Prometheus Alert Rules

```yaml
groups:
  - name: rag_system
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}"

      # High query latency
      - alert: HighQueryLatency
        expr: histogram_quantile(0.99, rag_query_duration_seconds) > 5
        for: 5m
        annotations:
          summary: "Query latency p99 > 5s"

      # High hallucination rate
      - alert: HighHallucinationRate
        expr: rag_hallucination_rate > 0.05
        for: 5m
        annotations:
          summary: "Hallucination rate exceeds 5%"

      # Low cache hit ratio
      - alert: LowCacheHitRatio
        expr: rag_cache_hit_ratio < 0.3
        for: 10m
        annotations:
          summary: "Cache hit ratio < 30%"

      # Vector DB unavailable
      - alert: VectorDBDown
        expr: up{job="vector_db"} == 0
        for: 1m
        annotations:
          summary: "Vector database is down"
```

---

## Performance Optimization Tips

### 1. Query Optimization
```python
# Pre-compute embeddings for common queries
COMMON_QUERIES_CACHE = {
    "What is your company?": cached_embedding,
    "What are your business hours?": cached_embedding,
}

# Implement query deduplication
def deduplicate_queries(current_query, recent_queries):
    """Return cached result if query is duplicate (> 90% similar)"""
    for prev_query in recent_queries:
        if calculate_similarity(current_query, prev_query) > 0.9:
            return get_cached_response(prev_query)
    return None
```

### 2. Batch Processing
```python
# Process documents in batches
BATCH_SIZE = 100

chunks_batch = []
for chunk in document_chunks:
    chunks_batch.append(chunk)
    
    if len(chunks_batch) >= BATCH_SIZE:
        # Batch embed all chunks at once (more efficient)
        embeddings = batch_embed(chunks_batch)
        store_in_vector_db(embeddings)
        chunks_batch = []
```

### 3. Connection Pooling
```python
# PostgreSQL connection pool
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,  # Test connections before using
)

# Redis connection pool
redis_pool = redis.ConnectionPool(
    host='localhost',
    port=6379,
    max_connections=50,
)
redis_client = redis.Redis(connection_pool=redis_pool)
```

---

## Logging Configuration (Python)

```python
import logging.config
import json

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
        },
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
    },
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/rag_system.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 10,
            "formatter": "json",
        },
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"],
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

# Structured logging example
logger.info(
    "Query processed successfully",
    extra={
        "user_id": "user_123",
        "query_id": query_id,
        "response_type": "grounded",
        "confidence": 0.92,
        "tokens_used": 350,
        "latency_ms": 1243,
    }
)
```

---

## Testing Examples

### Unit Test for Hallucination Detection

```python
import pytest
from rag_system import HallucinationDetector

def test_hallucination_detection():
    detector = HallucinationDetector(confidence_threshold=0.6)
    
    # Test case 1: Fully grounded response
    response = "According to the document, the company was founded in 2020."
    context = "The company was founded in 2020 by John Smith."
    
    confidence, is_grounded, risk = detector.validate_response_grounding(
        response, context, "When was the company founded?"
    )
    
    assert confidence > 0.8
    assert is_grounded is True
    
    # Test case 2: Hallucinated response
    response = "The company was founded in 1995."
    context = "The company was founded in 2020."
    
    confidence, is_grounded, risk = detector.validate_response_grounding(
        response, context, "When was the company founded?"
    )
    
    assert confidence < 0.6
    assert is_grounded is False
```

### Load Test with k6

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  let payload = JSON.stringify({
    query: 'What is the company vacation policy?',
    top_k: 5,
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': `user_${__VU}`,
    },
  };

  let res = http.post(
    'http://localhost:8080/query',
    payload,
    params
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has response': (r) => r.body.response.length > 0,
    'confidence > 0.6': (r) => JSON.parse(r.body).confidence_score > 0.6,
    'latency < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

---

## Dockerfile for Production

```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements_prod.txt .

# Install Python dependencies
RUN pip install --user --no-cache-dir -r requirements_prod.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Add to PATH
ENV PATH=/root/.local/bin:$PATH

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')" || exit 1

# Run application
EXPOSE 8080
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
```

---

These examples provide a complete template for implementing the production-grade RAG system. Customize them based on your specific requirements.
