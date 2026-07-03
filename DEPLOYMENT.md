# Production RAG System - Deployment Guide

## Quick Start (Development)

```bash
# 1. Clone and setup
git clone <repo>
cd RAG
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements_prod.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Run development server
streamlit run app.py

# Or with FastAPI:
uvicorn api:app --reload --host 0.0.0.0 --port 8080
```

---

## Production Deployment

### Option 0: Render Backend + Streamlit Frontend

This repository is now configured for:

- `rag-api` on Render as a free Python web service
- `app.py` on Streamlit Community Cloud as the free frontend

Render backend environment variables:

```bash
# Backend
OPENAI_API_KEY=your_openai_key_here
LLM_MODEL=gpt-3.5-turbo
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=1000
PUBLIC_API_URL=https://your-backend-service.onrender.com
ALLOWED_ORIGINS=http://localhost:3000
```

Streamlit Community Cloud secrets:

```toml
BACKEND_API_URL = "https://your-backend-service.onrender.com"
BACKEND_TIMEOUT_SECONDS = "60"
```

Streamlit Community Cloud runtime:

```text
python-3.11.9
```

Deployment flow:

1. Deploy the backend on Render using [render.yaml](/abs/path/c:/Desktop new/RAG/render.yaml:1).
2. In Streamlit Community Cloud, point the app to [app.py](/abs/path/c:/Desktop new/RAG/app.py:1).
3. Add the values from [.streamlit/secrets.toml.example](/abs/path/c:/Desktop new/RAG/.streamlit/secrets.toml.example:1) to the Streamlit app secrets UI.
4. Make sure Streamlit picks up [runtime.txt](/abs/path/c:/Desktop new/RAG/runtime.txt:1) so it uses Python 3.11.9.

Notes:

- The backend still exposes `/health`, `/query`, and document endpoints for the Streamlit app.
- Render free web services currently spin down after inactivity and do not support persistent disks, so uploaded files on the free backend are not durable across spin-downs, restarts, or redeploys.
- Streamlit Community Cloud reads the root `requirements.txt`, which is now trimmed to frontend-only dependencies.
- This Python pin avoids slow or stuck source builds for older Streamlit/Numpy combinations during cloud deploys.

### Option 1: Docker + Kubernetes

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements_prod.txt .
RUN pip install --no-cache-dir -r requirements_prod.txt

# Copy application
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Run application
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
```

**Kubernetes Deployment:**

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rag-system
  template:
    metadata:
      labels:
        app: rag-system
    spec:
      containers:
      - name: rag-app
        image: rag-system:latest
        ports:
        - containerPort: 8080
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: rag-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: rag-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: rag-system
```

### Option 2: AWS ECS + Fargate

```json
{
  "family": "rag-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "rag-app",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/rag-system:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "hostPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:rag-openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rag-system",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## Infrastructure Requirements

### Minimum Specification
- CPU: 2 cores
- RAM: 4GB
- Storage: 100GB (SSD for vector DB)
- Network: 100 Mbps

### Recommended Specification (Production)
- CPU: 8+ cores (ARM or x86)
- RAM: 16GB+
- Storage: 500GB+ NVMe SSD
- Network: 1Gbps
- Load Balancer: NGINX/HAProxy
- CDN: CloudFront/CloudFlare

### High Availability Setup
```
                      ┌─────────────┐
                      │  CloudFlare │
                      │    CDN      │
                      └──────┬──────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
            ┌─────────────────┐  ┌─────────────────┐
            │  Load Balancer  │  │  Load Balancer  │
            │  (Region 1)     │  │  (Region 2)     │
            └────────┬────────┘  └────────┬────────┘
                     │                    │
        ┌────────────┼────────────┐  ┌────┴─────┐
        ▼            ▼            ▼  ▼          ▼
      ┌──┐         ┌──┐         ┌──┐         ┌──┐
      │K8│         │K8│         │K8│         │K8│
      │  │         │  │         │  │         │  │
      └──┘         └──┘         └──┘         └──┘
        │            │            │            │
        └────────────┼────────────┴────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │PostgreSQL RDS Multi-AZ  │
    └─────────┘ └─────────┘ └─────────┘
        │
    ┌───┴────┐
    ▼        ▼
┌──────────┐ ┌──────────┐
│ Pinecone │ │   Redis  │
│ Vector DB│ │  Cluster │
└──────────┘ └──────────┘
```

---

## Monitoring & Observability

### Prometheus Metrics

```python
# Metrics to track
- http_requests_total (counter)
- http_request_duration_seconds (histogram)
- rag_queries_total (counter)
- rag_query_duration_seconds (histogram)
- hallucination_rate (gauge)
- cache_hit_ratio (gauge)
- vector_db_query_latency (histogram)
- llm_tokens_used_total (counter)
```

### Grafana Dashboard

Key metrics to visualize:
- Query latency (p50, p95, p99)
- Success/error rates
- Cache hit ratio
- Hallucination detection rate
- Cost per query
- Concurrent users

### Logging Strategy

```
Application Logs → JSON Logger
                     ↓
                  → ELK Stack
                  → Splunk
                  → CloudWatch
                  
Structured Log Format:
{
  "timestamp": "2024-01-22T10:30:45Z",
  "level": "INFO",
  "event_type": "query_processed",
  "user_id": "user_001",
  "query": "What is...?",
  "response_type": "grounded",
  "confidence": 0.95,
  "processing_time_ms": 1250,
  "model": "gpt-3.5-turbo",
  "tokens_used": 350
}
```

---

## Security Checklist

- [ ] Enable TLS 1.3 for all APIs
- [ ] Implement rate limiting (100 req/min per user)
- [ ] Enable authentication (OAuth 2.0 / OpenID Connect)
- [ ] Encrypt sensitive data at rest (AES-256)
- [ ] Implement RBAC for document access
- [ ] Enable audit logging for all queries
- [ ] Regular security audits (monthly)
- [ ] Penetration testing (quarterly)
- [ ] Vulnerability scanning (weekly)
- [ ] API key rotation (90-day cycle)
- [ ] DDoS protection enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Output encoding to prevent XSS
- [ ] Prepared statements for SQL injection prevention
- [ ] Secrets stored in secure vault (Vault, AWS Secrets Manager)
- [ ] Container image scanning for vulnerabilities
- [ ] Network segmentation implemented
- [ ] WAF (Web Application Firewall) enabled
- [ ] Regular backup testing

---

## Scaling Strategy

### Horizontal Scaling (Multi-Instance)
- Add replicas when CPU > 70% or Memory > 80%
- Max replicas: 10 per region
- Load balance with round-robin

### Vertical Scaling
- Increase container resources if single instance bottlenecked
- Monitor vector DB query latency

### Cache Optimization
- Query result cache: 1-hour TTL
- Embedding cache: LRU with 50k vectors
- Session cache: 24-hour retention

### Cost Optimization
- Batch API calls to LLM
- Use GPT-3.5-turbo for simple queries (80% of load)
- Reserve GPT-4 for complex queries
- Implement query deduplication
- Monitor token usage daily

---

## Disaster Recovery

### RTO/RPO Targets
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 4 hours

### Backup Schedule
- PostgreSQL: Daily snapshots + continuous replication
- Vector DB: Weekly snapshots + cross-region sync
- S3 Documents: Cross-region replication
- Retention: 30 days

### Failover Procedure
1. Detect failure (health check fails for 2 min)
2. Route traffic to backup region
3. Restore from latest backup
4. Verify data integrity
5. Run smoke tests

---

## Testing

### Load Testing with k6

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let res = http.post('http://localhost:8080/query', {
    query: 'What is RAG?',
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
}
```

### Security Testing
- OWASP Top 10 vulnerability scan
- SQL injection tests
- XSS attack simulation
- Rate limit testing
- API authentication bypass attempts

---

## Maintenance

### Weekly Tasks
- [ ] Check error rates in Prometheus
- [ ] Review slow queries in database
- [ ] Update security patches
- [ ] Verify backups completed successfully

### Monthly Tasks
- [ ] Security audit
- [ ] Cost analysis
- [ ] Performance review
- [ ] Capacity planning

### Quarterly Tasks
- [ ] Disaster recovery drill
- [ ] Penetration testing
- [ ] Architecture review
- [ ] Compliance check (GDPR, SOC2, etc.)
