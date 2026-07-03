# Enterprise RAG System

Production-focused Retrieval-Augmented Generation (RAG) app for document Q&A.

## What’s Included
- **Upload & index documents** (PDF/DOCX/TXT/MD and other text-like formats)
- **Grounded answers** using only retrieved context
- **Confidence + citations** in responses
- **FastAPI backend + Streamlit UI**

## MVP Note (Important)
This repo uses an **in-memory/mock vector store** in `backend/rag_system.py`.
Uploaded files are persisted to `data/uploads/` and ingested into the in-memory index for querying.

## Quick Start

1) Install dependencies
```bash
pip install -r requirements.txt
```

2) Configure environment
```bash
cp .env.example .env
# Required:
# OPENAI_API_KEY=...
```

3) Run Streamlit
```bash
streamlit run app.py
```

(Optional) Run the API server separately:
```bash
uvicorn backend.api:app --reload --port 8080
```

## API Endpoints
- `GET /health`
- `GET /ready`
- `POST /query`
- `POST /documents/upload`
- `POST /documents/upload-batch`
- `GET /documents`
- `DELETE /documents/{document_id}`

## Deployment (Render)
`render.yaml` deploys the FastAPI service with `uvicorn backend.api:app` and uses `PUBLIC_API_URL` + `ALLOWED_ORIGINS`.

