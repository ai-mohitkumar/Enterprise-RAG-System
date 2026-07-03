"""
Advanced Prompt Templates for RAG System
These templates are optimized for citation-based answers and hallucination reduction.
"""

from langchain.prompts import PromptTemplate

# Main QA Template with Citation Requirements
MAIN_QA_TEMPLATE = """
You are a precise AI assistant that answers questions based SOLELY on the provided context.
Your goal is to provide accurate, well-cited answers without adding external knowledge.

CONTEXT:
{context}

QUESTION: {question}

STRICT INSTRUCTIONS:
1. Answer ONLY using information from the provided context
2. If the context doesn't contain the answer, say: "I cannot find this information in the provided documents."
3. Include specific citations with document names and relevant quotes
4. Do not make assumptions or add information not in the context
5. Keep answers concise but comprehensive
6. Use direct quotes when possible for important claims

CITATION FORMAT:
- [Document Name, Page/Section]: "exact quote from context"

ANSWER:
"""

# Citation-Focused Template
CITATION_QA_TEMPLATE = """
Based on the following context, provide a well-cited answer to the question.

Context:
{context}

Question: {question}

Requirements:
- Answer using only the provided context
- Include at least 2-3 specific citations
- Format citations as: [Source]: "quote"
- If insufficient information, state this clearly

Answer with citations:
"""

# Hallucination-Reduction Template
HALLUCINATION_SAFE_TEMPLATE = """
TASK: Answer the question using ONLY the provided context. Do not use external knowledge.

CONTEXT:
{context}

QUESTION: {question}

VERIFICATION STEPS:
1. Scan context for relevant information
2. Extract direct quotes supporting the answer
3. If no relevant information found, respond with: "This information is not available in the provided documents."

RESPONSE FORMAT:
- Answer based only on context
- Include source citations
- Use quotes for key facts

Final Answer:
"""

# Multi-Hop Reasoning Template
MULTI_HOP_TEMPLATE = """
Analyze the context to answer the question. Connect information across multiple sections if needed.

Context:
{context}

Question: {question}

Analysis Steps:
1. Find all relevant information in the context
2. Connect related pieces of information
3. Synthesize a coherent answer
4. Cite sources for each key point

Answer with supporting citations:
"""

# Technical Document Template
TECHNICAL_QA_TEMPLATE = """
You are answering questions about technical documentation. Be precise and cite specific sections.

Technical Context:
{context}

Question: {question}

Technical Answer Requirements:
- Use exact terminology from the documentation
- Cite specific sections, classes, or functions
- Include code examples if available in context
- Explain technical concepts using documentation language

Technical Answer:
"""

# Comparative Analysis Template
COMPARISON_TEMPLATE = """
Compare and contrast information from the provided context to answer the question.

Context:
{context}

Question: {question}

Comparison Framework:
- Identify key similarities
- Note important differences
- Cite specific examples from context
- Provide balanced analysis

Comparative Answer:
"""

# Prompt Templates Dictionary
PROMPT_TEMPLATES = {
    "main_qa": PromptTemplate(
        template=MAIN_QA_TEMPLATE,
        input_variables=["context", "question"]
    ),
    "citation_focused": PromptTemplate(
        template=CITATION_QA_TEMPLATE,
        input_variables=["context", "question"]
    ),
    "hallucination_safe": PromptTemplate(
        template=HALLUCINATION_SAFE_TEMPLATE,
        input_variables=["context", "question"]
    ),
    "multi_hop": PromptTemplate(
        template=MULTI_HOP_TEMPLATE,
        input_variables=["context", "question"]
    ),
    "technical": PromptTemplate(
        template=TECHNICAL_QA_TEMPLATE,
        input_variables=["context", "question"]
    ),
    "comparison": PromptTemplate(
        template=COMPARISON_TEMPLATE,
        input_variables=["context", "question"]
    )
}

# Context Optimization Templates
CONTEXT_COMPRESSION_TEMPLATE = """
Condense the following context while preserving all key information and citations.

Original Context:
{context}

Condensed Context (keep essential information only):
"""

CONTEXT_RANKING_TEMPLATE = """
Rank the following context chunks by relevance to the question.
Return only the top 3 most relevant chunks.

Question: {question}

Context Chunks:
{context}

Ranked Chunks (most relevant first):
"""

# Quality Assurance Templates
QUALITY_CHECK_TEMPLATE = """
Verify if the following answer is fully supported by the context.

Answer: {answer}
Context: {context}
Question: {question}

Verification:
- Does the answer use only information from context? YES/NO
- Are citations accurate and relevant? YES/NO
- Is there any hallucinated information? YES/NO

Result: """

ANSWER_REFINEMENT_TEMPLATE = """
Refine the following answer to be more precise and better cited.

Original Answer: {answer}
Context: {context}
Question: {question}

Refined Answer (more precise, better citations):
"""

def get_prompt_template(template_name: str, **kwargs):
    """Get a prompt template by name with optional customization"""
    if template_name not in PROMPT_TEMPLATES:
        raise ValueError(f"Template {template_name} not found")

    template = PROMPT_TEMPLATES[template_name]

    # Apply customizations if provided
    if kwargs:
        template_text = template.template
        for key, value in kwargs.items():
            template_text = template_text.replace(f"{{{key}}}", str(value))

        return PromptTemplate(
            template=template_text,
            input_variables=template.input_variables
        )

    return template

def get_context_optimization_templates():
    """Get templates for context optimization"""
    return {
        "compression": PromptTemplate(
            template=CONTEXT_COMPRESSION_TEMPLATE,
            input_variables=["context"]
        ),
        "ranking": PromptTemplate(
            template=CONTEXT_RANKING_TEMPLATE,
            input_variables=["question", "context"]
        )
    }

def get_quality_assurance_templates():
    """Get templates for quality assurance"""
    return {
        "quality_check": PromptTemplate(
            template=QUALITY_CHECK_TEMPLATE,
            input_variables=["answer", "context", "question"]
        ),
        "refinement": PromptTemplate(
            template=ANSWER_REFINEMENT_TEMPLATE,
            input_variables=["answer", "context", "question"]
        )
    }
