from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path
import re

logger = logging.getLogger(__name__)


def naive_chunk_text(text: str, *, chunk_size: int = 512, chunk_overlap: int = 128) -> List[str]:
    """Naive chunker (character-based) to support MVP ingestion.

    Note: `chunk_size` and `chunk_overlap` are interpreted as character counts.
    For a production system, switch to token-based chunking.
    """
    if not text:
        return []

    # Normalize whitespace but preserve newlines a bit
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[\t ]+", " ", text).strip()

    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if chunk_overlap < 0:
        raise ValueError("chunk_overlap must be >= 0")
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be < chunk_size")

    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == len(text):
            break
        start = max(0, end - chunk_overlap)

    return chunks


def decode_bytes_to_text(content: bytes, *, filename: str = "") -> Tuple[str, str]:
    """Decode bytes into text for MVP.

    Returns: (text, detected_encoding)
    """
    if not content:
        return "", ""

    # Best-effort decode strategies
    for enc in ("utf-8", "utf-16", "latin-1"):
        try:
            return content.decode(enc), enc
        except UnicodeDecodeError:
            continue

    # Fallback (should rarely happen)
    return content.decode("utf-8", errors="ignore"), "utf-8(ignore)"


def extract_text_from_uploaded_bytes(content: bytes, *, filename: str, ext: str) -> str:
    """Extract text for supported formats.

    MVP behavior:
    - Non-PDF: decode as text.
    - PDF: best-effort: attempt to import pdfminer.six; if not available, return empty string.

    For production you should use a proper PDF loader/OCR pipeline.
    """
    if ext == ".pdf":
        try:
            from pdfminer.high_level import extract_text  # type: ignore
            # pdfminer expects a file-like or path; we cannot write temp files reliably here,
            # so we fall back to a decode-less strategy: return empty (caller can decide).
            # If you want full PDF support, extend this to use a temp file.
            _ = extract_text  # silence linters
            logger.warning("PDF text extraction not implemented in this MVP; returning empty text")
            return ""
        except Exception:
            logger.warning("PDF extraction dependencies not available; returning empty text")
            return ""

    text, _enc = decode_bytes_to_text(content, filename=filename)
    return text


def build_chunks_for_rag(
    *,
    document_id: str,
    filename: str,
    content: str,
    chunk_size: int = 512,
    chunk_overlap: int = 128,
    document_type: str = "unknown",
) -> List[Dict[str, Any]]:
    """Create RAG vector-store documents matching VectorStore.add_documents schema."""
    chunks = naive_chunk_text(content, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    vector_docs: List[Dict[str, Any]] = []

    for i, chunk_text in enumerate(chunks):
        chunk_id = f"{document_id}_chunk_{i:04d}"
        vector_docs.append(
            {
                "document_id": document_id,
                "chunk_id": chunk_id,
                "content": chunk_text,
                "metadata": {
                    "filename": filename,
                    "document_type": document_type,
                    "chunk_index": i,
                },
            }
        )

    return vector_docs

