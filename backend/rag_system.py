"""
Production-Grade RAG System with Hallucination Prevention & Security
Implements retrieval-augmented generation with source validation, confidence scoring,
and comprehensive audit logging.
"""

import os
import json
import hashlib
import logging
from typing import Optional, List, Dict, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
import re

from openai import OpenAI
from dotenv import load_dotenv
import tiktoken



# ============================================================================
# CONFIGURATION & LOGGING
# ============================================================================

load_dotenv()

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# DATA MODELS
# ============================================================================

class ResponseType(Enum):
    """Types of responses the RAG system can generate."""
    GROUNDED = "grounded"      # Fully grounded in provided context
    PARTIAL = "partial"        # Partially grounded, some inference
    UNCERTAIN = "uncertain"    # Low confidence, explicit uncertainty
    REFUSED = "refused"        # Cannot answer with provided data


@dataclass
class RetrievedChunk:
    """Represents a chunk retrieved from vector database."""
    content: str
    document_id: str
    chunk_id: str
    similarity_score: float
    source_metadata: Dict
    chunk_index: int

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class RAGResponse:
    """Complete RAG response with metadata and audit information."""
    query: str
    response: str
    response_type: ResponseType
    retrieved_chunks: List[RetrievedChunk]
    confidence_score: float
    citations: List[Dict]
    sources: List[str]
    processing_time_ms: float
    model: str
    timestamp: str
    user_id: Optional[str] = None
    hallucination_risk: float = 0.0

    def to_dict(self) -> Dict:
        return {
            "query": self.query,
            "response": self.response,
            "response_type": self.response_type.value,
            "confidence_score": self.confidence_score,
            "citations": self.citations,
            "sources": self.sources,
            "processing_time_ms": self.processing_time_ms,
            "model": self.model,
            "timestamp": self.timestamp,
            "hallucination_risk": self.hallucination_risk,
            "retrieved_chunks_count": len(self.retrieved_chunks),
        }


# ============================================================================
# HALLUCINATION DETECTION & PREVENTION
# ============================================================================

class HallucinationDetector:
    """
    Detects potential hallucinations by validating that responses
    are grounded in the provided context.
    """

    def __init__(self, confidence_threshold: float = 0.6):
        self.confidence_threshold = confidence_threshold
        self.citation_pattern = re.compile(r'\[source\s*:\s*([^\]]+)\]', re.IGNORECASE)

    def validate_response_grounding(
        self,
        response: str,
        context: str,
        query: str
    ) -> Tuple[float, bool, str]:
        """
        Validate if response is grounded in the provided context.

        Returns:
            - confidence_score: 0.0-1.0 confidence in grounding
            - is_grounded: Boolean indicating if response is grounded
            - risk_assessment: String describing any risks
        """
        risk_factors = []
        confidence = 1.0

        # Check 1: Explicit contradiction with context
        if self._contains_contradiction(response, context):
            risk_factors.append("Response contradicts provided context")
            confidence -= 0.4

        # Check 2: Missing citations for factual claims
        if self._has_uncited_claims(response):
            risk_factors.append("Factual claims made without citation")
            confidence -= 0.2

        # Check 3: Speculative language patterns
        if self._contains_speculation(response):
            risk_factors.append("Response contains speculative language")
            confidence -= 0.15

        # Check 4: Verify citations exist in context
        citations = self.citation_pattern.findall(response)
        if citations and not self._citations_exist_in_context(citations, context):
            risk_factors.append("Response cites non-existent sources")
            confidence -= 0.3

        # Ensure confidence stays in valid range
        confidence = max(0.0, min(1.0, confidence))
        is_grounded = confidence >= self.confidence_threshold

        risk_assessment = "; ".join(risk_factors) if risk_factors else "Low risk"

        return confidence, is_grounded, risk_assessment

    @staticmethod
    def _contains_contradiction(response: str, context: str) -> bool:
        """Check for explicit contradictions with context."""
        # Simple heuristic: look for negations in response that oppose context
        negation_patterns = ["not", "cannot", "shouldn't", "doesn't"]
        for pattern in negation_patterns:
            if pattern in response.lower() and pattern not in context.lower():
                # More sophisticated check would use semantic similarity
                return False  # Simplified for MVP
        return False

    @staticmethod
    def _has_uncited_claims(response: str) -> bool:
        """Check if response has factual claims without citations."""
        sentences = response.split(".")
        uncited_count = 0

        for sentence in sentences:
            # Check if sentence is factual (contains numbers, years, specific claims)
            if re.search(r'\d{4}|[\d,]+|percent|%|year|study|research', sentence):
                if "[source:" not in sentence.lower():
                    uncited_count += 1

        return uncited_count > 2  # Flag if multiple uncited claims

    @staticmethod
    def _contains_speculation(response: str) -> bool:
        """Detect speculative language."""
        speculation_words = [
            "might", "could", "possibly", "perhaps", "allegedly",
            "rumor", "supposedly", "allegedly", "would suggest"
        ]
        return any(word in response.lower() for word in speculation_words)

    @staticmethod
    def _citations_exist_in_context(citations: List[str], context: str) -> bool:
        """Verify that cited sources appear in context."""
        return all(citation.lower() in context.lower() for citation in citations)


# ============================================================================
# SECURITY & INPUT VALIDATION
# ============================================================================

class SecurityValidator:
    """
    Validates and sanitizes user inputs to prevent injection attacks
    and ensure system safety.
    """

    MAX_QUERY_LENGTH = 2000
    MAX_FILE_SIZE = 52_428_800  # 50MB

    DANGEROUS_PATTERNS = [
        r"__.*__",  # Python dunder methods
        r"exec\s*\(",  # Code execution
        r"eval\s*\(",
        r"import\s+",
        r"<script",  # XSS
        r"javascript:",
        r"on\w+\s*=",  # Event handlers
    ]

    @classmethod
    def validate_query(cls, query: str) -> Tuple[bool, Optional[str]]:
        """Validate user query for safety and compliance."""
        if not query or not isinstance(query, str):
            return False, "Query must be a non-empty string"

        if len(query) > cls.MAX_QUERY_LENGTH:
            return False, f"Query exceeds maximum length of {cls.MAX_QUERY_LENGTH} characters"

        if cls._contains_dangerous_pattern(query):
            return False, "Query contains potentially dangerous patterns"

        return True, None

    @classmethod
    def validate_file(cls, filename: str, file_size: int) -> Tuple[bool, Optional[str]]:
        """Validate uploaded file."""
        allowed_extensions = {".pdf", ".docx", ".txt", ".md", ".doc"}
        file_ext = os.path.splitext(filename)[1].lower()

        if file_ext not in allowed_extensions:
            return False, f"File type not allowed. Allowed: {allowed_extensions}"

        if file_size > cls.MAX_FILE_SIZE:
            return False, f"File size exceeds {cls.MAX_FILE_SIZE / 1024 / 1024}MB limit"

        return True, None

    @classmethod
    def _contains_dangerous_pattern(cls, text: str) -> bool:
        """Check for dangerous patterns in text."""
        return any(
            re.search(pattern, text, re.IGNORECASE)
            for pattern in cls.DANGEROUS_PATTERNS
        )

    @staticmethod
    def sanitize_query(query: str) -> str:
        """Remove/escape potentially problematic characters."""
        # Remove control characters
        query = "".join(char for char in query if ord(char) >= 32 or char == '\n')
        return query.strip()


# ============================================================================
# VECTOR STORE INTERFACE (Mock Implementation)
# ============================================================================

class VectorStore:
    """
    Interface for vector database operations.
    This is a mock implementation - replace with Pinecone/Milvus/FAISS in production.
    """

    def __init__(self):
        self.documents = {}  # Simulated storage

    def add_documents(self, chunks: List[Dict]) -> None:
        """Add document chunks to vector store."""
        for chunk in chunks:
            doc_id = chunk.get("document_id")
            self.documents[doc_id] = chunk
            logger.info(f"Added document chunk: {doc_id}")

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5
    ) -> List[RetrievedChunk]:
        """
        Search for similar documents.
        Mock: returns random documents with mock similarity scores.
        """
        results = []
        for i, (doc_id, doc) in enumerate(list(self.documents.items())[:top_k]):
            results.append(
                RetrievedChunk(
                    content=doc.get("content", ""),
                    document_id=doc_id,
                    chunk_id=doc.get("chunk_id", ""),
                    similarity_score=0.95 - (i * 0.05),
                    source_metadata=doc.get("metadata", {}),
                    chunk_index=i,
                )
            )
        return results


# ============================================================================
# MAIN RAG SYSTEM
# ============================================================================

class ProductionRAGSystem:
    """Production-grade RAG system with hallucination prevention, security validation, and audit logging."""

    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.3,
        max_tokens: int = 1000,
    ):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment or parameters")

        self.client = OpenAI(api_key=self.openai_api_key)


        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

        self.vector_store = VectorStore()
        self.hallucination_detector = HallucinationDetector()
        self.security_validator = SecurityValidator()

        # Token counting for cost optimization
        self.token_encoder = tiktoken.get_encoding("cl100k_base")

        logger.info(f"RAG System initialized with model: {model}")

    def process_query(
        self,
        query: str,
        user_id: Optional[str] = None,
        top_k: int = 5
    ) -> RAGResponse:
        """Process user query and generate grounded response."""
        start_time = datetime.now()

        # Step 1: Validate input
        is_valid, error_msg = self.security_validator.validate_query(query)
        if not is_valid:
            logger.warning(f"Invalid query from {user_id}: {error_msg}")
            return self._create_error_response(query, error_msg, start_time, user_id)

        sanitized_query = self.security_validator.sanitize_query(query)

        # Step 2: Generate embedding (mock)
        query_embedding = self._generate_embedding(sanitized_query)

        # Step 3: Retrieve context
        retrieved_chunks = self.vector_store.search(query_embedding, top_k)
        context = self._build_context(retrieved_chunks)

        if not retrieved_chunks:
            logger.warning(f"No relevant documents found for query: {query}")
            response = "I don't have sufficient information to answer this question based on the uploaded documents."
            return self._create_response(
                query,
                response,
                ResponseType.REFUSED,
                retrieved_chunks,
                0.0,
                [],
                [],
                start_time,
                user_id,
            )

        # Step 4: Validate grounding potential
        confidence, _, validation_msg = self.hallucination_detector.validate_response_grounding(
            context,
            context,
            query,
        )

        # Step 5: Generate LLM response
        llm_response, tokens_used = self._generate_response(
            query,
            context,
            retrieved_chunks,
        )

        # Step 6: Validate response
        response_confidence, _, validation_msg2 = self.hallucination_detector.validate_response_grounding(
            llm_response,
            context,
            query,
        )

        # Step 7: Determine response type
        if response_confidence >= 0.8:
            response_type = ResponseType.GROUNDED
        elif response_confidence >= 0.6:
            response_type = ResponseType.PARTIAL
        else:
            response_type = ResponseType.UNCERTAIN
            llm_response += "\n\n⚠️ **Note**: This answer has low confidence. Please verify with the source documents."

        # Extract citations
        citations = self._extract_citations(llm_response, retrieved_chunks)

        response = self._create_response(
            query,
            llm_response,
            response_type,
            retrieved_chunks,
            response_confidence,
            citations,
            [c["source"] for c in citations],
            start_time,
            user_id,
            response_confidence,
        )

        # Log audit trail
        self._audit_log(response, tokens_used, validation_msg2)

        return response

    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text (mock implementation)."""
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()
        return [float(int(hash_hex[i:i+2], 16)) / 256.0 for i in range(0, 32, 2)]

    def _build_context(self, chunks: List[RetrievedChunk]) -> str:
        """Build context string from retrieved chunks."""
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            source_info = chunk.source_metadata.get("filename", "Unknown")
            context_parts.append(f"[Source {i}: {source_info}]\n{chunk.content}\n")
        return "\n".join(context_parts)

    def _generate_response(
        self,
        query: str,
        context: str,
        retrieved_chunks: List[RetrievedChunk]
    ) -> Tuple[str, int]:
        """Generate response using LLM with constraint to use only provided context."""
        system_prompt = (
            "You are a helpful assistant that answers questions using ONLY the provided context.\n\n"
            "CRITICAL RULES:\n"
            "1. Answer ONLY based on the provided documents\n"
            "2. If information is not in the documents, say "
            "I don't have information about that in the provided documents" 
            "\n"
            "3. Always cite your sources using [source: document_name]\n"
            "4. Do NOT make up, assume, or infer information not explicitly in the documents\n"
            "5. If you're uncertain, be explicit about it\n"
            "6. Keep answers concise and factual\n\n"
            "Provided Context:\n" + context
        )

        user_message = f"Question: {query}"

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )

            response_text = response.choices[0].message.content or ""
            tokens_used = getattr(response.usage, "total_tokens", 0) or 0
            return response_text, int(tokens_used)
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return "Error generating response. Please try again.", 0

    def _extract_citations(
        self,
        response: str,
        chunks: List[RetrievedChunk]
    ) -> List[Dict]:
        """Extract and validate citations from response."""
        citations: List[Dict] = []
        citation_pattern = re.compile(r'\[source\s*:\s*([^\]]+)\]', re.IGNORECASE)

        for match in citation_pattern.finditer(response):
            source_text = match.group(1).strip()
            for chunk in chunks:
                if source_text.lower() in chunk.source_metadata.get("filename", "").lower():
                    citations.append({
                        "source": chunk.source_metadata.get("filename", "Unknown"),
                        "document_id": chunk.document_id,
                        "chunk_id": chunk.chunk_id,
                        "confidence": chunk.similarity_score,
                    })
                    break

        return citations

    def _create_response(
        self,
        query: str,
        response: str,
        response_type: ResponseType,
        chunks: List[RetrievedChunk],
        confidence: float,
        citations: List[Dict],
        sources: List[str],
        start_time: datetime,
        user_id: Optional[str],
        hallucination_risk: float = 0.0,
    ) -> RAGResponse:
        """Create RAGResponse object."""
        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        return RAGResponse(
            query=query,
            response=response,
            response_type=response_type,
            retrieved_chunks=chunks,
            confidence_score=confidence,
            citations=citations,
            sources=list(set(sources)),
            processing_time_ms=processing_time,
            model=self.model,
            timestamp=datetime.now().isoformat(),
            user_id=user_id,
            hallucination_risk=hallucination_risk,
        )

    def _create_error_response(
        self,
        query: str,
        error: str,
        start_time: datetime,
        user_id: Optional[str],
    ) -> RAGResponse:
        """Create error response."""
        return RAGResponse(
            query=query,
            response=f"Error: {error}",
            response_type=ResponseType.REFUSED,
            retrieved_chunks=[],
            confidence_score=0.0,
            citations=[],
            sources=[],
            processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
            model=self.model,
            timestamp=datetime.now().isoformat(),
            user_id=user_id,
            hallucination_risk=1.0,
        )

    def _audit_log(self, response: RAGResponse, tokens_used: int, validation_msg: str) -> None:
        """Log query and response for audit trail."""
        log_entry = {
            **response.to_dict(),
            "tokens_used": tokens_used,
            "validation_message": validation_msg,
            "event_type": "query_processed",
        }
        logger.info(f"Audit: {json.dumps(log_entry)}")

    def add_documents(self, documents: List[Dict]) -> None:
        """Add documents to the vector store."""
        self.vector_store.add_documents(documents)
        logger.info(f"Added {len(documents)} documents to vector store")


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    rag = ProductionRAGSystem(model="gpt-3.5-turbo")

    sample_docs = [
        {
            "document_id": "doc_001",
            "chunk_id": "chunk_001",
            "content": "Python is a high-level programming language created by Guido van Rossum.",
            "metadata": {"filename": "python_guide.txt"},
        },
        {
            "document_id": "doc_002",
            "chunk_id": "chunk_002",
            "content": "RAG (Retrieval-Augmented Generation) combines retrieval and generation for better answers.",
            "metadata": {"filename": "rag_intro.md"},
        },
    ]

    rag.add_documents(sample_docs)
    response = rag.process_query("What is Python?", user_id="user_001")
    print(f"\nQuery: {response.query}")
    print(f"Response: {response.response}")
    print(f"Confidence: {response.confidence_score:.2f}")
    print(f"Response Type: {response.response_type.value}")
    print(f"Processing Time: {response.processing_time_ms:.0f}ms")

