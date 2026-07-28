# AI Module: Knowledge

## Purpose
Retrieval-Augmented Generation (RAG) knowledge store for security insights and CVEs.

## Key Components
- `knowledge_base.py`: RAG Knowledge Base manager indexing CVE, CWE, and NIST vulnerability data.
- `vector_store.py`: Vector database interface (pgvector/FAISS) for semantic security search.
- `embeddings.py`: Embedding generation service converting code snippets into vector representation.
