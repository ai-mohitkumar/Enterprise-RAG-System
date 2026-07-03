# Production-Grade RAG System

A scalable, enterprise-ready Retrieval-Augmented Generation (RAG) system designed for document-based Q&A with hallucination prevention, security, and audit trails.

---

## 1. HIGH-LEVEL ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Streamlit Web UI │ API Gateway (FastAPI) │ Document Upload │
└────────────┬──────────────────────────────────────────┬──────┘
             │                                          │
             │                                    Document Storage
             │                                    (S3/Azure Blob)
             ▼                                          │
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  • Document Processing Pipeline                             │
│  • Query Router & Intent Detection                          │
│  • RAG Orchestrator                                         │
│  • Context Validator (Hallucination Prevention)             │
└────┬──────────────────┬───────────────────┬─────────────────┘
     │                  │                   │
     ▼                  ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Embedding   │  │  Vector DB   │  │  LLM Module  │
│  Service     │  │  (Pinecone/  │  │  (OpenAI/    │
│  (OpenAI)    │  │   Milvus)    │  │   Claude)    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐   ┌──────────────┐  ┌──────────┐
   │ Postgres│   │  Redis Cache │  │ Audit    │
   │ Metadata│   │  (Results,   │  │ Logger   │
   │ Store   │   │   Sessions)  │  │ (Events) │
   └─────────┘   └──────────────┘  └──────────┘
        │                │                │
        └────────────────┼────────────────┘
                         ▼
              ┌──────────────────────┐
              │  Monitoring & Logging│
              │  (Prometheus/ELK)    │
              └──────────────────────┘
```

---

## 2. RAG PIPELINE (STEP-BY-STEP)

### Phase 1: Ingestion Pipeline
```
1. Document Upload
   ├─ Validate file type (PDF, DOCX, TXT, MD)
   ├─ Virus scan (ClamAV)
   ├─ Store metadata in PostgreSQL
   └─ Save file to S3 with encryption

2. Document Processing
   ├─ Extract text (OCR for images)
   ├─ Normalize content (remove duplicates)
   ├─ Extract metadata (title, date, source)
   └─ Store in audit log

3. Chunking Strategy
   ├─ Semantic chunking (preserve meaning)
   ├─ Chunk size: 512-1024 tokens
   ├─ Overlap: 128 tokens (context continuity)
   └─ Preserve source references (document_id + chunk_id)

4. Embedding Generation
   ├─ Tokenize chunks
   ├─ Generate embeddings (OpenAI: text-embedding-3-large)
   ├─ Store in vector DB with metadata
   └─ Create hybrid search index (dense + sparse)

5. Indexing
   ├─ Store in vector database (Pinecone/Milvus)
   ├─ Create full-text search index (PostgreSQL)
   ├─ Cache frequent queries (Redis)
   └─ Version control for updates
```

### Phase 2: Query Processing Pipeline
```
1. User Query Input
   ├─ Sanitize input (prevent injection attacks)
   ├─ Extract intent & entities
   ├─ Validate query length (max 2000 chars)
   └─ Log query anonymously

2. Query Enhancement
   ├─ Spell-check & normalization
   ├─ Expand abbreviations
   ├─ Add user context (previous conversations)
   └─ Generate query embeddings

3. Retrieval (Multi-Strategy)
   ├─ Vector similarity search (top-k retrieval)
   │  └─ Retrieve top-5 semantically similar chunks
   ├─ Full-text search (BM25)
   │  └─ Retrieve top-3 keyword matches
   ├─ Reranking
   │  └─ Use cross-encoder to rank results (top-3)
   └─ Deduplicate & merge results

4. Context Assembly
   ├─ Retrieve relevant chunks from vector DB
   ├─ Verify source document exists
   ├─ Inject metadata (chunk source, confidence score)
   ├─ Create source attribution format
   └─ Build retrieval context (max 8k tokens)

5. Hallucination Prevention
   ├─ Check: "Is answer derivable from context?"
   ├─ Confidence scoring on retrieved chunks
   ├─ Fact validation layer
   ├─ Enforce "I don't know" when confidence < threshold
   └─ Cite all sources explicitly

6. LLM Response Generation
   ├─ Construct system prompt with instructions:
   │  • "Use ONLY provided context"
   │  • "Cite sources for every claim"
   │  • "Say 'I don't have this info' if uncertain"
   ├─ Temperature: 0.3 (low randomness)
   ├─ Max tokens: 1000
   ├─ Stop sequences: ["\nUser:", "###"]
   └─ Stream response for UX

7. Response Validation
   ├─ Check response references sources
   ├─ Verify no hallucinations detected
   ├─ Calculate confidence score
   ├─ Extract citations
   └─ Store in audit log
```

---

## 3. DATA FLOW EXPLANATION

```
INPUT FLOW (Document Ingestion):
User Upload → Validation → Processing → Chunking → Embedding → Vector DB
                                       ↓
                            Metadata → PostgreSQL

QUERY FLOW (Real-time Q&A):
User Query → Intent Detection → Embedding Generation
                                        ↓
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
            Vector Search         Full-Text Search    Cache Check
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        ▼
                            Reranker (Cross-Encoder)
                                        ▼
                    Top Chunks + Metadata + Confidence Scores
                                        ▼
                        Hallucination Validator
                                        ▼
                        LLM with Constrained Context
                                        ▼
                    Response + Source Citations + Confidence
                                        ▼
                    Display to User + Cache Result + Log Event
```

---

## 4. TECH STACK (WITH REASONS)

### Core Components

| Component | Technology | Reason |
|-----------|-----------|--------|
| **Vector DB** | Pinecone / Milvus | Pinecone: Managed, scalable, enterprise SLAs. Milvus: Open-source, on-premise control |
| **Embeddings** | OpenAI text-embedding-3-large | State-of-the-art, 3072 dimensions, high accuracy |
| **LLM** | OpenAI GPT-4 / Anthropic Claude | GPT-4: General purpose, fine control. Claude: Better for long context (200k) |
| **Metadata DB** | PostgreSQL | ACID compliance, JSON support, full-text search |
| **Caching** | Redis | Sub-millisecond latency, distributed support |
| **Document Storage** | AWS S3 / Azure Blob | Scalable, versioned, encrypted, audit logs |
| **API Framework** | FastAPI | Async, OpenAPI auto-docs, validation with Pydantic |
| **Frontend** | Streamlit (MVP) / React (Production) | Streamlit: Rapid dev. React: Enterprise features |
| **Search Enhancement** | Reranker (SBERT/mmarco) | Cross-encoder for precision ranking |
| **Monitoring** | Prometheus + Grafana + ELK | Observability, performance metrics, error tracking |
| **Authentication** | Keycloak / Auth0 | SSO, role-based access, audit trails |

### Document Processing

| Task | Tool | Reason |
|------|------|--------|
| PDF Extraction | PyPDF / pdfplumber | Reliable, handles complex layouts |
| OCR | Tesseract / AWS Textract | Textract: Managed, high accuracy for scanned docs |
| DOCX Parsing | python-docx | Preserves formatting, metadata |
| Virus Scanning | ClamAV | Open-source, real-time definitions |

---

## 5. SECURITY & SCALABILITY CONSIDERATIONS

### Security

```
1. INPUT VALIDATION
   ├─ File type whitelist (PDF, DOCX, TXT, MD)
   ├─ Max file size: 50MB
   ├─ Virus/malware scanning (ClamAV)
   ├─ Query injection prevention (parameterized queries)
   └─ Rate limiting (10 requests/min per user)

2. DATA ENCRYPTION
   ├─ At Rest: AES-256 for files in S3
   ├─ In Transit: TLS 1.3 for all APIs
   ├─ In Memory: Sensitive data cleared after use
   └─ Database: Encrypted connections (SSL)

3. ACCESS CONTROL
   ├─ Authentication: OAuth 2.0 / OpenID Connect
   ├─ Authorization: Role-based access control (RBAC)
   ├─ Document Isolation: Users see only own documents
   ├─ Audit Logging: All queries & downloads logged
   └─ API Keys: Rotated every 90 days

4. PRIVACY
   ├─ Data Retention: Configurable deletion policies
   ├─ PII Detection: Regex patterns to redact sensitive data
   ├─ GDPR Compliance: Right to deletion, data portability
   ├─ Anonymization: Hash user IDs in logs
   └─ No Training: Documents not used for LLM fine-tuning

5. MONITORING & ALERTS
   ├─ Anomaly Detection: Unusual query patterns
   ├─ Hallucination Alerts: Flagged responses reviewed
   ├─ Error Rate Monitoring: Alert if > 5% failures
   ├─ Security Events: Login failures, permission violations
   └─ Audit Trail: Immutable logs (write-once storage)
```

### Scalability

```
1. HORIZONTAL SCALING
   ├─ Containerization: Docker for all components
   ├─ Orchestration: Kubernetes for auto-scaling
   ├─ Load Balancing: NGINX / HAProxy
   ├─ Database Clustering: PostgreSQL replication
   └─ Vector DB: Sharding across regions

2. PERFORMANCE OPTIMIZATION
   ├─ Caching Strategy:
   │  ├─ Query Results (Redis): 1hr TTL
   │  ├─ Embeddings Cache: LRU (50k vectors)
   │  └─ Session Cache: User state for 24hrs
   ├─ Batch Processing:
   │  ├─ Process documents in background jobs
   │  ├─ Embed chunks in parallel (thread pool)
   │  └─ Deduplicate before embedding (saves 30% cost)
   ├─ Search Optimization:
   │  ├─ Hybrid search (dense + sparse)
   │  ├─ Reranker limits candidates to top-3
   │  ├─ Index pruning monthly
   │  └─ Cache frequent queries

3. COST OPTIMIZATION
   ├─ Token Counting: Pre-calculate before API calls
   ├─ Batch Embeddings: Use batch API for bulk operations
   ├─ Query Optimization: Smart caching reduces 40% LLM calls
   ├─ On-Premise Option: Ollama for local LLMs (no API cost)
   └─ Model Selection: Use GPT-3.5 for simple queries, GPT-4 for complex

4. DISASTER RECOVERY
   ├─ Backup Strategy:
   │  ├─ Daily snapshots of PostgreSQL
   │  ├─ Vector DB backups (weekly)
   │  ├─ S3 cross-region replication
   │  └─ 30-day retention
   ├─ RTO/RPO:
   │  ├─ RTO (Recovery Time Objective): < 1 hour
   │  ├─ RPO (Recovery Point Objective): < 4 hours
   │  └─ Multi-region failover: Active-Active setup
   └─ Testing: Monthly disaster recovery drills

5. MONITORING METRICS
   ├─ System Health:
   │  ├─ API latency (p50, p95, p99)
   │  ├─ Vector DB query time
   │  ├─ LLM response time
   │  └─ Cache hit ratio (target: > 60%)
   ├─ Quality Metrics:
   │  ├─ Hallucination rate (target: < 2%)
   │  ├─ Answer relevance (ROUGE score)
   │  ├─ User feedback rating
   │  └─ Citation accuracy
   ├─ Business Metrics:
   │  ├─ Concurrent users
   │  ├─ Documents indexed
   │  ├─ Average response time
   │  └─ Cost per query
```

---

## 6. IMPLEMENTATION PHASES

### Phase 1: MVP (Weeks 1-2)
- [x] Document upload functionality
- [x] Basic RAG pipeline
- [x] Streamlit UI
- [x] PostgreSQL for metadata
- [x] Pinecone for vector search

### Phase 2: Hardening (Weeks 3-4)
- [ ] Authentication & authorization
- [ ] Encryption at rest/transit
- [ ] Hallucination prevention layer
- [ ] Audit logging
- [ ] Input validation & sanitization

### Phase 3: Production (Weeks 5-8)
- [ ] Kubernetes deployment
- [ ] Load balancing & auto-scaling
- [ ] Advanced monitoring
- [ ] Disaster recovery setup
- [ ] Performance optimization

### Phase 4: Enterprise (Weeks 9+)
- [ ] Multi-tenancy support
- [ ] Custom LLM fine-tuning
- [ ] Advanced analytics dashboard
- [ ] Compliance certifications (SOC2, ISO27001)
- [ ] API rate limiting & quotas

---

## Setup

> Note: This repository currently uses an **in-memory/mock vector store** in `backend/rag_system.py` (so Pinecone/FAISS are optional for the MVP). Uploads are persisted to `data/uploads/` and indexed into the in-memory store for query answering.

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Required for LLM calls:
   # OPENAI_API_KEY=...

   # Optional runtime knobs:
   # LLM_MODEL=gpt-3.5-turbo
   # LLM_TEMPERATURE=0.3
   # LLM_MAX_TOKENS=1000

   # Backend CORS (optional):
   # ALLOWED_ORIGINS=http://localhost:3000
   ```

3. **Run the application**
   ```bash
   streamlit run app.py
   ```

4. **(Recommended) Run the API server separately**
   ```bash
   uvicorn backend.api:app --reload --port 8080
   ```

---

## Key Architectural Principles

✅ **Separation of Concerns**: Document processing, retrieval, and generation are independent
✅ **Fail-Safe Defaults**: System defaults to "I don't know" rather than hallucinating
✅ **Auditability**: Every query logged with sources and confidence scores
✅ **Scalability**: Stateless services allow horizontal scaling
✅ **Security First**: Defense in depth with multiple validation layers

## Architecture

- **Frontend**: Streamlit for the web interface
- **Backend**: LangChain for RAG implementation
- **Vector Store**: FAISS for document embeddings
- **LLM**: OpenAI GPT models
- **Data Sources**: Web scraping from educational platforms

## Success Metrics

- User engagement: Average session time >5 minutes
- Accuracy: 80%+ user satisfaction ratings
- Adoption: 10,000 active users in 6 months
- Performance: Response time <2 seconds, 99% uptime

## Deployment

This project is designed to be deployable on cloud platforms like:
- Streamlit Cloud
- Heroku
- AWS/GCP/Azure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
#   E n t e r p r i s e - R A G - S y s t e m  
 