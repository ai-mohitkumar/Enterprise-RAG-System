# TODO

## Document ingestion into RAG (MVP)
- [ ] Inspect current upload endpoints and how they persist files
- [ ] Add minimal ingestion pipeline to extract text from uploaded bytes
- [ ] Implement naive chunking (chunk_size / overlap)
- [ ] Call `ProductionRAGSystem.add_documents()` with chunk objects
- [ ] Ensure citations format `[source: filename]` matches chunk metadata
- [ ] Run `python -m compileall` to verify syntax
- [ ] Manual test: upload a .txt/.md and query for a factual answer

