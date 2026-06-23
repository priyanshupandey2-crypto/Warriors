"""Vector Database Integration for RAG"""

import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Document:
    """Document with metadata"""
    id: str
    content: str
    metadata: Dict[str, Any]
    source_url: Optional[str] = None
    source_type: str = "unknown"  # academic, industry, educational, practical


class VectorDBProvider:
    """Abstract base for vector database providers"""

    async def initialize(self) -> None:
        """Initialize the vector database"""
        pass

    async def add_documents(self, documents: List[Document]) -> None:
        """Add documents to the database"""
        pass

    async def search(self, query: str, top_k: int = 5) -> List[Document]:
        """Search for relevant documents"""
        return []


class PineconeVectorDB(VectorDBProvider):
    """Pinecone vector database integration"""

    def __init__(self, api_key: Optional[str] = None, environment: Optional[str] = None):
        """Initialize Pinecone provider

        Args:
            api_key: Pinecone API key
            environment: Pinecone environment
        """
        self.api_key = api_key or os.getenv("PINECONE_API_KEY")
        self.environment = environment or os.getenv("PINECONE_ENV", "prod")
        self.index = None
        self.index_name = "ai-lxp-research"

    async def initialize(self) -> None:
        """Initialize Pinecone connection"""
        if not self.api_key:
            print("Warning: Pinecone not configured. Using mock mode.")
            self.index = None
            return

        try:
            import pinecone

            pinecone.init(api_key=self.api_key, environment=self.environment)
            # Create or get index
            try:
                self.index = pinecone.Index(self.index_name)
            except Exception:
                # Index doesn't exist, will be created on first use
                pass
            print("Pinecone initialized successfully")
        except ImportError:
            print("Pinecone not installed. Install with: pip install pinecone-client")
        except Exception as e:
            print(f"Warning: Pinecone initialization failed: {e}. Using mock mode.")

    async def add_documents(self, documents: List[Document]) -> None:
        """Add documents to Pinecone"""
        if not self.index:
            print("Mock: Adding documents to vector DB")
            return

        try:
            try:
                from langchain.embeddings import OpenAIEmbeddings
                from langchain.text_splitter import RecursiveCharacterTextSplitter
            except ImportError:
                print("LangChain not installed. Using mock mode.")
                return

            embeddings = OpenAIEmbeddings()
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

            vectors = []
            for doc in documents:
                chunks = splitter.split_text(doc.content)

                for i, chunk in enumerate(chunks):
                    embedding = embeddings.embed_query(chunk)
                    vector_id = f"{doc.id}_chunk_{i}"
                    metadata = {
                        **doc.metadata,
                        "source_url": doc.source_url,
                        "source_type": doc.source_type,
                        "chunk_index": i,
                    }
                    vectors.append((vector_id, embedding, metadata))

            if vectors:
                self.index.upsert(vectors=vectors, namespace=self.index_name)
                print(f"Added {len(vectors)} vectors to Pinecone")

        except Exception as e:
            print(f"Error adding documents to Pinecone: {e}")

    async def search(self, query: str, top_k: int = 5) -> List[Document]:
        """Search Pinecone for relevant documents"""
        if not self.index:
            print(f"Mock: Searching for '{query}'")
            return []

        try:
            try:
                from langchain.embeddings import OpenAIEmbeddings
            except ImportError:
                print("LangChain not installed. Using mock mode.")
                return []

            embeddings = OpenAIEmbeddings()
            query_embedding = embeddings.embed_query(query)

            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                namespace=self.index_name,
            )

            documents = []
            for match in results.get("matches", []):
                doc = Document(
                    id=match["id"],
                    content=match["metadata"].get("content", ""),
                    metadata={k: v for k, v in match["metadata"].items()
                             if k not in ["content", "source_url", "source_type"]},
                    source_url=match["metadata"].get("source_url"),
                    source_type=match["metadata"].get("source_type", "unknown"),
                )
                documents.append(doc)

            return documents

        except Exception as e:
            print(f"Error searching Pinecone: {e}")
            return []


class MockVectorDB(VectorDBProvider):
    """Mock vector database for development"""

    def __init__(self):
        """Initialize mock database"""
        self.documents: Dict[str, Document] = {}

    async def initialize(self) -> None:
        """Initialize mock database"""
        print("Mock vector database initialized")

    async def add_documents(self, documents: List[Document]) -> None:
        """Store documents in memory"""
        for doc in documents:
            self.documents[doc.id] = doc
        print(f"Mock: Stored {len(documents)} documents")

    async def search(self, query: str, top_k: int = 5) -> List[Document]:
        """Search documents by keyword (simple mock)"""
        query_lower = query.lower()
        results = [
            doc
            for doc in self.documents.values()
            if query_lower in doc.content.lower() or any(
                query_lower in str(v).lower() for v in doc.metadata.values()
            )
        ]
        return results[:top_k]

    async def delete_index(self, index_name: str) -> None:
        """Clear documents"""
        self.documents.clear()


def get_vector_db_provider() -> VectorDBProvider:
    """Get vector database provider based on configuration

    Returns:
        VectorDBProvider instance
    """
    if os.getenv("PINECONE_API_KEY"):
        return PineconeVectorDB()
    else:
        print("Using mock vector database (for development)")
        return MockVectorDB()
