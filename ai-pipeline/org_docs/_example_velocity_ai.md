---
organisation: "GLoballogic"
project: "Velocity AI"
tags: ["AI","ai", "Machine Learning", "NLP", "LLM", "Prompt Engineering"]
description: "Velocity AI is an internal platform that automates repetitive enterprise workflows using large language models and semantic search."
---

# Velocity AI

Velocity AI is our flagship internal AI platform designed to accelerate enterprise productivity by combining Large Language Models (LLMs) with specialized agents. It focuses on reducing manual toil in document processing, code reviews, and customer support triage.

## Core Architecture

The system is built on a microservices architecture using FastAPI (Python) and Node.js. 

### Key Components

1. **Ingestion Engine**: Processes unstructured data (PDFs, emails, Slack messages) and structures it using OCR and weak supervision.
2. **Semantic Knowledge Graph**: Data is indexed into a vector database (Pinecone) enriched with contextual metadata (Neo4j) to form a knowledge graph.
3. **Agentic Router**: A lightweight LLM router that classifies user intent and dispatches tasks to specialized agents (e.g., CodeReviewAgent, SupportTriageAgent).
4. **Execution Sandbox**: A secure Docker-based environment where agents can run Python code or API calls to fulfill complex requests safely.

## Tech Stack

- **Models**: Llama-3 (self-hosted for privacy), GPT-4 (for complex logic via API)
- **Frameworks**: LangChain, LlamaIndex, FastAPI, React
- **Infrastructure**: Kubernetes, AWS (EKS, RDS, S3), Pinecone

## Real-World Applications

- **Automated RFP Responses**: Velocity AI reduces the time to respond to Request for Proposals (RFPs) from 3 days to 4 hours by instantly pulling relevant answers from past successful bids using semantic search.
- **Code Review Assistant**: It continuously monitors GitHub PRs and posts contextual feedback regarding performance bottlenecks and security vulnerabilities before human review.

## Key Learnings & Pitfalls

- **Hallucination Mitigation**: Early versions trusted LLM outputs too heavily. We implemented a "Verify-Then-Commit" pattern where the output must pass a deterministic validation step before being served.
- **Latency**: Chaining too many LLM calls increased response times to over 30 seconds. We optimized this by replacing intermediate LLM calls with classical NLP heuristics or smaller, fine-tuned models.
