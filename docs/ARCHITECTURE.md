# CsmartAI Monorepo Architecture

## 1. System Overview

CsmartAI is an enterprise e-commerce platform integrated with specialized AI micro-pipelines for Optical Character Recognition (OCR), Named Entity Recognition (NER), Intent Classification, Natural Language to SQL (Text-to-SQL), and Human-in-the-Loop (HITL) continuous learning.

```
CsmartAI/
├── docker-compose.yml             # Container orchestration (PostgreSQL, Redis, AI, Server, Web apps)
├── schema.sql                     # Authoritative PostgreSQL DDL (UUID-based)
├── seed.sql                       # Initial development seed dataset
├── docs/
│   └── ARCHITECTURE.md            # System architecture reference
├── cl_admin/                      # Next.js Admin Dashboard
│   ├── app/                       # App Router routes with co-located _components/
│   ├── components/                # Shared UI and layout components
│   ├── hooks/                     # Custom React hooks
│   ├── libs/                      # API client and utility libraries
│   └── types/                     # TypeScript definitions (Entities, AI types)
├── cl_user/                       # Next.js Client Storefront
│   ├── app/                       # Storefront routes
│   └── components/                # Storefront UI components
├── pipeline_ai/                   # Python FastAPI AI Engine
│   ├── app/
│   │   ├── api/                   # API routers and endpoints
│   │   ├── core/                  # Configuration and singleton model loaders
│   │   └── services/              # Pipeline modules (OCR, NER, Intent, SQL, Search)
│   ├── data/                      # Datasets (ViText2SQL, Few-shot datasets)
│   ├── scripts/                   # HITL dataset export and background cron workers
│   └── requirements.txt
└── server/                        # NestJS API Gateway & Backend Core
    └── src/
        ├── common/                # Guards, interceptors, decorators, filters
        ├── config/                # Environment configuration
        ├── database/              # Database module & Base repository
        └── modules/               # Domain modules (Flattened entity/repository layout)
```

---

## 2. Component Roles & Specifications

### 2.1. Backend API (`server`)
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with parameterized queries via `DatabaseService` connection pool.
- **Queue System**: Redis + BullMQ for asynchronous AI task offloading (OCR processing, evaluation jobs).
- **Module Structure**: Flattened domain modules (`orders`, `products`, `categories`, `users`, `payments`, `hitl`, `ai-logs`, `ai-tasks`, `ai-proxy`, `copilot`, `faqs`). Each module contains `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.entity.ts`, `*.module.ts`, and a `dto/` directory.

### 2.2. AI Engine Pipeline (`pipeline_ai`)
- **Framework**: FastAPI (Python 3.13)
- **Pipelines**:
  - `ocr_pipeline.py`: EasyOCR multi-pass recognition, image preprocessing (CLAHE), dynamic specification window parsing, and product matching.
  - `intent_pipeline.py`: Keyword rule matching combined with LLM-backed intent classification and confidence scoring.
  - `sql_pipeline.py`: ViText2SQL dataset matching, Few-shot RAG context retrieval from `ai_review_queue`, LLM SQL generation, and strict AST/regex validation.
  - `ner_pipeline.py`: Regex and semantic extraction for order codes, addresses, and customer intents.
  - `hybrid_search.py`: Vector embeddings combined with keyword search for product retrieval.
- **HITL Integration**: Low-confidence requests (`confidence_score < 0.70` or `flag_for_review = true`) are pushed to `ai_review_queue` for manual audit and exported for fine-tuning via `scripts/export_hitl_dataset.py`.
.000.00000000000000000
### 2.3. Admin Portal (`cl_admin`)
- **Framework**: Next.js App Router (React 19, TypeScript)
- **Architecture**: Route-colocated sub-components under `app/(dashboard)/<route>/_components/`. Shared global UI primitives located in `components/ui/` and `components/layouts/`.

### 2.4. Customer Storefront (`cl_user`)
- **Framework**: Next.js App Router (React 19, TypeScript)
- **Scope**: E-commerce customer catalog browsing, cart operations, checkout, and AI shopping assistant.
