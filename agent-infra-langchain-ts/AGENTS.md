# Agent Infra (LangChain + TypeScript) — Agent Guide

This document provides essential information for AI coding agents working on this project.

## Project Overview

**Agent Infra** is a reusable AI Agent infrastructure for multi-project Web3 products. It provides a Fastify-based API server with LangChain integration for building conversational AI agents with memory, session management, and RAG (Retrieval-Augmented Generation) capabilities.

### Key Features
- Long-term memory (persistent semantic memory per user)
- Fast memory (in-memory cache of latest memory items)
- Session per user (persistent session history)
- Context management (recent context window)
- Pluggable memory backend (`local` / `letta` / `redis`)
- Pluggable session backend (`local` / `redis`)
- **Pluggable LLM provider** (`openai` / `kimi` / `heurist`)
- **OAuth authentication** (for Kimi Code integration)
- RAG ingestion pipeline (documents → chunks → query)
- Pluggable RAG backend (`none` / `llamaindex`)
- Structured tools with tool-calling support
- Tool policy guardrail (`safe_only` / `allow_all`)
- Tool audit logging for observability
- Session persona loading via `SOUL.md`, `CHARACTER.md`, `SKILL.md`

## Technology Stack

- **Runtime**: Node.js 22+ with ES Modules (`"type": "module"`)
- **Language**: TypeScript 5.7+
- **Web Framework**: Fastify 4.x
- **AI/LLM**: LangChain Core + OpenAI/Kimi/Heurist integration
- **Validation**: Zod
- **Persistence**: JSON-backed (default), Redis (optional)
- **Package Manager**: npm (with yarn.lock for compatibility)

## Project Structure

```
src/
├── agent/                    # Agent runtime and retrievers
│   ├── runtime.ts           # Core AgentRuntime class with tool-calling loop
│   ├── retriever-factory.ts # Factory for creating retriever providers
│   ├── retriever-provider.ts # Retriever interface definition
│   ├── basic-retriever.ts   # Basic in-memory retriever
│   └── llamaindex-retriever.ts # LlamaIndex API retriever
├── api/                      # API schemas
│   └── schemas.ts           # Zod validation schemas for API requests
├── config/                   # Configuration
│   ├── env.ts               # Environment variable validation with Zod
│   └── persona.ts           # Persona loading from SOUL.md, CHARACTER.md, SKILL.md
├── llm/                      # LLM provider factory
│   └── factory.ts           # Factory for OpenAI, Kimi, and Heurist providers
├── memory/                   # Memory management
│   ├── provider.ts          # MemoryProvider interface
│   ├── types.ts             # MemoryItem, MemorySearchResult types
│   ├── memory-manager.ts    # Local memory implementation (JSON-backed)
│   ├── local-memory-provider.ts # Local memory provider wrapper
│   ├── redis-memory-provider.ts # Redis-backed memory provider
│   ├── letta-memory-provider.ts # Letta API memory provider
│   └── factory.ts           # Factory for creating memory providers
├── oauth/                    # OAuth authentication
│   ├── types.ts             # OAuth type definitions
│   ├── config.ts            # OAuth configuration
│   ├── store.ts             # OAuth state/session storage
│   └── service.ts           # OAuth service implementation
├── session/                  # Session management
│   ├── provider.ts          # SessionProvider interface and types
│   ├── session-manager.ts   # Local session implementation (JSON-backed)
│   ├── redis-session-manager.ts # Redis-backed session manager
│   └── factory.ts           # Factory for creating session providers
├── rag/                      # RAG (Retrieval-Augmented Generation)
│   ├── types.ts             # RAGDocument, RAGChunk, RAGIngestJob types
│   ├── schemas.ts           # Zod schemas for RAG API requests
│   ├── store.ts             # RAG storage (JSON-backed)
│   ├── service.ts           # RAG business logic (ingest, query)
│   └── chunker.ts           # Text chunking utility
├── tools/                    # Tools and policies
│   ├── toolkit.ts           # Built-in tools (memory_save, memory_search, etc.)
│   ├── policy.ts            # Tool policy enforcement (safe_only/allow_all)
│   └── audit.ts             # Tool audit logging
├── utils/                    # Utilities
│   ├── json-store.ts        # JSON file read/write utilities
│   ├── redis.ts             # Redis client singleton
│   └── http.ts              # HTTP utilities
└── server.ts                # Fastify server bootstrap and routes
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development (hot reload with tsx)
npm run dev

# Type check only
npm run typecheck

# Build for production (compiles to dist/)
npm run build

# Start production server (requires build first)
npm run start
```

## Configuration

Configuration is managed via environment variables in `.env` file (copy from `.env.example`):

```bash
# ============================================
# LLM Provider Configuration
# ============================================

# Choose your LLM provider: openai | kimi | heurist
LLM_PROVIDER=openai

# --- OpenAI Configuration ---
OPENAI_API_KEY=your_openai_key_here
OPENAI_BASE_URL=                    # Optional: custom OpenAI-compatible endpoint

# --- Kimi (Moonshot AI) Configuration ---
KIMI_API_KEY=your_kimi_key_here
KIMI_BASE_URL=https://api.moonshot.cn/v1

# --- Heurist LLM Gateway Configuration ---
HEURIST_API_KEY=your_user_id#your_api_key_here
HEURIST_BASE_URL=https://llm-gateway.heurist.xyz

# Default model (provider-specific)
# OpenAI: gpt-4.1-mini, gpt-4, gpt-3.5-turbo
# Kimi: kimi-k2-turbo-preview, kimi-k2-5, kimi-k2
# Heurist: hermes-3-llama3.1-8b, mistralai/mixtral-8x7b-instruct
MODEL=gpt-4.1-mini

# ============================================
# Server Configuration
# ============================================
PORT=8787
NODE_ENV=development

# ============================================
# OAuth Configuration (Optional)
# ============================================

# Enable OAuth authentication
OAUTH_ENABLED=false

# OAuth provider: kimi | custom
OAUTH_PROVIDER=kimi

# OAuth credentials (required when OAUTH_ENABLED=true)
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REDIRECT_URI=http://localhost:8787/v1/oauth/callback

# Custom OAuth endpoints (only needed if OAUTH_PROVIDER=custom)
OAUTH_AUTH_URL=https://kimi.com/oauth/authorize
OAUTH_TOKEN_URL=https://kimi.com/oauth/token
OAUTH_USERINFO_URL=https://kimi.com/oauth/userinfo

# ============================================
# Feature Flags
# ============================================
TOOL_POLICY_MODE=safe_only          # safe_only | allow_all
MEMORY_BACKEND=local                # local | letta | redis
SESSION_BACKEND=local               # local | redis
RAG_BACKEND=none                    # none | llamaindex

# ============================================
# Optional Adapter Configs
# ============================================

# Letta Memory Adapter
LETTA_BASE_URL=
LETTA_API_KEY=

# LlamaIndex RAG Adapter
LLAMAINDEX_BASE_URL=
LLAMAINDEX_API_KEY=

# Redis (for memory/session backends)
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=agentinfra
```

## API Endpoints

### Health Check
```
GET /health
Response: { ok: true, service: "...", llmProvider: "...", oauthEnabled: true/false }
```

### Chat
```
POST /v1/chat
Body: { userId: string, sessionId?: string, message: string }
```

### OAuth Authentication

#### Get Login URL
```
GET /v1/oauth/login?redirectUrl=/dashboard
Response: { ok: true, url: "...", state: "..." }
```

#### OAuth Callback
```
GET /v1/oauth/callback?code=xxx&state=yyy
Response: { ok: true, userId: "...", userInfo: {...}, redirectUrl: "..." }
```

#### Get Current Session
```
GET /v1/oauth/session
Response: { ok: true, userId: "...", userInfo: {...}, provider: "..." }
```

#### Logout
```
POST /v1/oauth/logout
Response: { ok: true, message: "Logged out successfully" }
```

### RAG Ingest
```
POST /v1/rag/ingest
Body: { tenantId: string, source: string, content: string, metadata?: object }
```

### RAG Job Status
```
GET /v1/rag/jobs/:jobId
```

### RAG Search
```
GET /v1/rag/search?tenantId=xxx&query=xxx&limit=5
```

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2022
- Module: NodeNext (ES modules with `.js` extensions in imports)
- Strict mode enabled with additional safety flags:
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
- Import paths must include `.js` extension even for `.ts` files

### Import Patterns
```typescript
// Always use .js extension for local imports
import { env } from "./config/env.js";
import type { MemoryProvider } from "./memory/provider.js";

// Use type-only imports for types
import type { MemoryItem } from "./memory/types.js";
```

### Naming Conventions
- Classes: PascalCase (e.g., `AgentRuntime`, `MemoryManager`)
- Interfaces/Types: PascalCase (e.g., `MemoryProvider`, `SessionMessage`)
- Functions: camelCase (e.g., `createMemoryProvider`, `isToolAllowed`)
- Constants: UPPER_SNAKE_CASE for true constants
- Files: kebab-case (e.g., `memory-manager.ts`, `json-store.ts`)

### Error Handling
- Use Zod for input validation
- Return structured error responses: `{ ok: false, error: string | object }`
- Log errors with Fastify's logger: `req.log.error({ err: error }, "message")`
- Exit on invalid env config in `config/env.ts`

### Async Patterns
- Prefer `async/await` over raw Promises
- Initialize providers in `bootstrap()` before starting server
- Handle errors with try/catch in route handlers

## Architecture Patterns

### Provider Pattern
All backend services use a provider pattern with factory functions:

```typescript
// provider.ts - interface
export type MemoryProvider = {
  init(): Promise<void>;
  upsert(userId: string, text: string, tags?: string[]): Promise<MemoryItem>;
  // ...
};

// factory.ts - runtime selection
export function createMemoryProvider(): MemoryProvider {
  if (env.MEMORY_BACKEND === "letta") return new LettaMemoryProvider();
  if (env.MEMORY_BACKEND === "redis") return new RedisMemoryProvider();
  return new LocalMemoryProvider();
}
```

### LLM Provider Pattern
The LLM provider uses a factory pattern to support multiple providers:

```typescript
// src/llm/factory.ts
export function createLLM(provider?: LLMProvider): ChatOpenAI {
  const selectedProvider = provider ?? env.LLM_PROVIDER;
  
  if (selectedProvider === "kimi") {
    return createKimiLLM();
  }
  
  return createOpenAILLM();
}
```

Kimi API is fully OpenAI-compatible - just different base URL and API key.

### OAuth Pattern
OAuth implementation uses the standard authorization code flow with PKCE:

```typescript
// 1. Generate auth URL with state
const { url, state } = await oauthService.generateAuthUrl(redirectUrl);

// 2. Handle callback and exchange code for tokens
const { session, redirectUrl } = await oauthService.handleCallback(code, state);

// 3. Validate and refresh session
const session = await oauthService.validateSession(sessionId);
```

### Tool System
Tools are built using LangChain's `DynamicStructuredTool` with Zod schemas:

```typescript
const memorySave = new DynamicStructuredTool({
  name: "memory_save",
  description: "Save long-term user memory...",
  schema: z.object({ text: z.string().min(2), tags: z.array(z.string()).default([]) }),
  func: async ({ text, tags }) => { /* ... */ }
});
```

Built-in tools:
- `memory_save` - Persist user preferences/facts
- `memory_search` - Semantic search in memory
- `context_get` - Read recent session context
- `time_now` - Get current UTC timestamp

### Tool Policy
Tool execution is controlled by `TOOL_POLICY_MODE`:
- `safe_only` (default): Only allows vetted tools (`memory_save`, `memory_search`, `context_get`, `time_now`)
- `allow_all`: Allows all registered tools

All tool calls are logged to `src/data/tool-audit.json`.

### Persona Loading
Session persona is dynamically built from markdown files at startup:
- `SOUL.md` - Core identity and behavioral defaults
- `CHARACTER.md` - Session character profile and voice
- `SKILL.md` - Skill contract and session rules

## Data Storage

### Local Backend (Default)
JSON files in `src/data/` (gitignored):
- `memory.json` - Long-term memory items with embeddings
- `sessions.json` - Session messages
- `rag-docs.json` - RAG documents
- `rag-chunks.json` - RAG chunks
- `rag-jobs.json` - RAG ingestion jobs
- `tool-audit.json` - Tool usage audit log
- `oauth-states.json` - OAuth state storage
- `oauth-sessions.json` - OAuth session storage

### Redis Backend
When configured, data is stored in Redis with prefixed keys:
- `agentinfra:memory:{userId}` - List of memory items
- `agentinfra:session:{sessionId}` - Session data

## Testing Strategy

Currently, the project does not have an automated test suite. Testing is primarily done through:

1. **Type checking**: `npm run typecheck`
2. **Manual testing**: Use the API endpoints with tools like curl or Postman
3. **CI pipeline**: Type check and build verification on push/PR

### Manual Testing Examples

```bash
# Health check
curl http://localhost:8787/health

# Chat
curl -X POST http://localhost:8787/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"hello"}'

# RAG ingest
curl -X POST http://localhost:8787/v1/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test","source":"test.txt","content":"Hello world"}'

# OAuth login URL
curl http://localhost:8787/v1/oauth/login

# OAuth session
curl http://localhost:8787/v1/oauth/session \
  -H "Cookie: oauth_session=xxx"
```

## CI/CD

### GitHub Actions Workflows

**CI** (`.github/workflows/ci.yml`):
- Triggers: Push/PR to main branch
- Steps: Install dependencies → Type check → Build
- Node.js version: 22

**CodeQL** (`.github/workflows/codeql.yml`):
- Triggers: Push/PR to main, weekly schedule (Monday 3 AM)
- Purpose: Static security analysis

## Security Considerations

### Environment Variables
- Never commit `.env` file
- `OPENAI_API_KEY` and `KIMI_API_KEY` are sensitive credentials
- `OAUTH_CLIENT_SECRET` must be kept secure
- Redis URL may contain credentials - use with caution

### Tool Policy
- Default mode is `safe_only` - explicitly enable `allow_all` only when needed
- All tool calls are audited with user/session context

### Data Storage
- Local JSON storage is not encrypted
- Avoid storing sensitive secrets in memory
- Redis communication should use TLS in production

### API Security (Production Checklist)
- OAuth is available but optional - add auth middleware for production if not using OAuth
- No rate limiting implemented - add before production use
- No request validation beyond Zod schemas
- Consider adding CORS configuration for Fastify

## External Backend Adapters

### Letta Memory Adapter
Expected endpoints:
- `POST /v1/memory/upsert`
- `POST /v1/memory/search`
- `GET /health`

### LlamaIndex RAG Adapter
Expected endpoint:
- `POST /v1/retrieve`

### Kimi API
Kimi API is OpenAI-compatible:
- Base URL: `https://api.moonshot.cn/v1`
- Authentication: API Key in Authorization header
- Compatible endpoints: `/v1/chat/completions`, `/v1/embeddings`

### Heurist LLM Gateway
Heurist provides decentralized open-source LLMs with OpenAI-compatible API:
- Base URL: `https://llm-gateway.heurist.xyz`
- Authentication: API Key in format `user_id#api_key`
- Compatible endpoints:
  - `/v1/chat/completions` - Chat completions with tool calling support
  - `/v1/embeddings` - Text embeddings
- Supported models: `hermes-3-llama3.1-8b`, `mistralai/mixtral-8x7b-instruct`, `meta-llama/llama-3-70b-instruct`, etc.

If your deployment uses different API contracts, modify only the adapter files:
- `src/memory/letta-memory-provider.ts`
- `src/agent/llamaindex-retriever.ts`
- `src/llm/factory.ts`

## Common Development Tasks

### Adding a New Tool
1. Add tool definition in `src/tools/toolkit.ts`
2. Add to `SAFE_TOOLS` in `src/tools/policy.ts` if it should be considered safe
3. Update documentation

### Adding a New Backend Provider
1. Create provider class implementing the interface
2. Add to factory function with env check
3. Update env schema in `src/config/env.ts`
4. Document in `.env.example`

### Adding a New LLM Provider
1. Add provider config in `src/config/env.ts`
2. Add factory function in `src/llm/factory.ts`
3. Update `LLM_PROVIDER` env validation
4. Document in `.env.example` and README.md

### Modifying API Schemas
1. Update Zod schema in appropriate `schemas.ts` file
2. Update route handler in `src/server.ts`
3. Update API documentation in this file and README.md

## Important Files for Agents

When making changes, pay attention to:
- `src/config/env.ts` - All env vars must be validated here
- `src/agent/runtime.ts` - Core agent logic, handle with care
- `src/llm/factory.ts` - LLM provider selection
- `src/tools/policy.ts` - Tool safety definitions
- Factory files - Backend selection logic
- Provider interfaces - Contract definitions
