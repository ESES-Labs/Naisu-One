# Project-Based Multi-Tenancy Documentation

This document explains how the AI Agent Infrastructure supports multiple projects with complete isolation.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Isolation Layers](#isolation-layers)
- [Project Setup](#project-setup)
- [Frontend Integration](#frontend-integration)
- [Admin Dashboard Guide](#admin-dashboard-guide)
- [Project Integration Guide](#project-integration-guide)

---

## Overview

The AI Agent Infrastructure now supports **project-based multi-tenancy**, allowing you to run multiple AI agents (like Naisu1) on the same infrastructure while maintaining complete isolation between projects.

### Key Features

- ✅ **Project Isolation** - Each project has its own character, tools, and RAG knowledge
- ✅ **User Isolation** - Users within a project can't see each other's data
- ✅ **Session Management** - Persistent conversations per user
- ✅ **Memory Isolation** - User preferences and facts are private
- ✅ **RAG Isolation** - Knowledge base is scoped per project

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI Agent Infrastructure                           │
│                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐                   │
│  │   Project: Naisu1   │  │ Project: OtherApp   │                   │
│  │   (DeFi Agent)      │  │ (Future Project)    │                   │
│  ├─────────────────────┤  ├─────────────────────┤                   │
│  │ • Character/Persona │  │ • Character/Persona │                   │
│  │ • Custom Tools      │  │ • Custom Tools      │                   │
│  │ • RAG Knowledge     │  │ • RAG Knowledge     │                   │
│  │ • User Memories     │  │ • User Memories     │                   │
│  │ • Sessions          │  │ • Sessions          │                   │
│  └─────────────────────┘  └─────────────────────┘                   │
│                                                                      │
│  Isolation: projectId + userId                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ Naisu1      │    │ Naisu1      │    │ OtherApp    │
   │ Backend     │    │ Frontend    │    │ Frontend    │
   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Isolation Layers

### 1. Project Isolation

Each project is identified by `projectId`:

| Resource | Isolation Key | Example |
|----------|--------------|---------|
| Character | `projectId` | `projects/naisu1.md` |
| Memory | `projectId + userId` | `naisu1:user-123` |
| Session | `projectId + userId` | `naisu1:user-123` |
| RAG | `projectId` (as tenantId) | `naisu1` |
| Tools | Global (shared) or project-scoped | - |

### 2. User Isolation

Within a project, users are isolated by `userId`:

```
Project: naisu1
├── User: 0x1234...
│   ├── Memory: "Prefers low slippage"
│   ├── Session: "sess-abc" (conversation history)
│   └── Preferences: Arbitrum user
│
└── User: 0x5678...
    ├── Memory: "New to DeFi"
    ├── Session: "sess-xyz" (different conversation)
    └── Preferences: Ethereum mainnet
```

User A **cannot** see User B's memory or sessions.

### 3. Session Continuity

Sessions allow conversation continuity:

```javascript
// First message
{ projectId: "naisu1", userId: "0x1234", message: "Hi" }
// Returns: { sessionId: "sess-abc", message: "Hello!" }

// Continue conversation
{ projectId: "naisu1", userId: "0x1234", sessionId: "sess-abc", message: "Swap 100 USDC" }
// Agent remembers previous context
```

---

## Project Setup

### Step 1: Create Project Character

Create a file `projects/{projectId}.md`:

```markdown
# Naisu1 - DeFi Agent Character

You are Naisu1, an expert cross-chain DeFi agent...

## Personality
- Professional and efficient
- Security-focused

## Capabilities
1. Token Swaps
2. Bridging
3. Liquidity Provision
...
```

### Step 2: Create Project API Key

```bash
curl -X POST http://localhost:8787/v1/keys \
  -H "Authorization: Bearer <master-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Naisu1 Project",
    "permissions": ["chat:write", "tools:execute"],
    "description": "API key for Naisu1 DeFi agent"
  }'
```

Response:
```json
{
  "ok": true,
  "key": "sk-naisu1-xxxxx...",
  "apiKey": {
    "id": "...",
    "keyPrefix": "sk-naisu1...",
    "name": "Naisu1 Project"
  }
}
```

Save the `key` - it's shown only once!

### Step 3: Create Custom Tools

Create tools that call your backend:

```bash
curl -X POST http://localhost:8787/v1/admin/tools \
  -H "Authorization: Bearer <master-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "build_swap",
    "description": "Build a swap transaction",
    "parameters": [
      { "name": "fromToken", "type": "string", "description": "Source token", "required": true },
      { "name": "toToken", "type": "string", "description": "Target token", "required": true },
      { "name": "amount", "type": "string", "description": "Amount to swap", "required": true },
      { "name": "chain", "type": "string", "description": "Blockchain", "required": true },
      { "name": "userAddress", "type": "string", "description": "User wallet address", "required": true }
    ],
    "execution": {
      "type": "http",
      "url": "https://naisu1-backend.yourdomain.com/api/build-swap",
      "method": "POST",
      "headers": {
        "X-API-Key": "{{NAISU1_BACKEND_KEY}}"
      },
      "bodyTemplate": "{\"fromToken\": \"{{fromToken}}\", \"toToken\": \"{{toToken}}\", \"amount\": \"{{amount}}\", \"chain\": \"{{chain}}\", \"userAddress\": \"{{userAddress}}\"}"
    }
  }'
```

### Step 4: Upload Knowledge Base (RAG)

```bash
# Upload DeFi documentation
curl -X POST http://localhost:8787/v1/rag/upload \
  -H "Authorization: Bearer <master-key>" \
  -F "file=@defi-protocols.pdf" \
  -F "tenantId=naisu1"

# Upload more docs
curl -X POST http://localhost:8787/v1/rag/upload \
  -H "Authorization: Bearer <master-key>" \
  -F "file=@supported-chains.md" \
  -F "tenantId=naisu1"
```

### Step 5: Test Integration

```bash
curl -X POST http://localhost:8787/v1/chat \
  -H "Authorization: Bearer sk-naisu1-xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "naisu1",
    "userId": "0x1234...",
    "message": "What can you do?"
  }'
```

---

## Frontend Integration

### Common API Client

```typescript
// api/agent.ts
const AGENT_API_URL = process.env.REACT_APP_AGENT_API_URL || 'http://localhost:8787';

interface ChatRequest {
  projectId: string;
  userId: string;
  sessionId?: string;
  message: string;
}

interface ChatResponse {
  ok: boolean;
  sessionId: string;
  message: string;
}

class AgentAPI {
  constructor(private apiKey: string) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${AGENT_API_URL}/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Chat failed');
    }

    return response.json();
  }

  // Continue existing session
  async continueChat(
    projectId: string, 
    userId: string, 
    sessionId: string, 
    message: string
  ): Promise<ChatResponse> {
    return this.chat({ projectId, userId, sessionId, message });
  }
}

export default AgentAPI;
```

---

## Admin Dashboard Guide

### What Admin Dashboard Needs to Do

The admin dashboard is for **managing the infrastructure** - creating projects, managing API keys, uploading knowledge, monitoring usage.

### 1. Project Management

```typescript
// components/ProjectManager.tsx
import { useState, useEffect } from 'react';

function ProjectManager({ adminApi }: { adminApi: AdminAPI }) {
  const [projects, setProjects] = useState([]);

  // Create new project
  async function createProject(name: string, characterMarkdown: string) {
    // 1. Create API key for the project
    const keyResponse = await adminApi.createKey({
      name: `${name} Project`,
      permissions: ['chat:write', 'tools:execute']
    });

    // 2. Save character file
    await adminApi.uploadCharacter(name.toLowerCase(), characterMarkdown);

    return keyResponse;
  }

  // Upload knowledge base
  async function uploadKnowledge(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', projectId);

    return adminApi.uploadRAG(formData);
  }

  // Create custom tool
  async function createTool(toolConfig: CreateToolInput) {
    return adminApi.createTool(toolConfig);
  }

  return (
    <div>
      <h2>Project Management</h2>
      
      {/* Create Project */}
      <CreateProjectForm onSubmit={createProject} />
      
      {/* List Projects */}
      <ProjectList projects={projects} />
      
      {/* Upload Knowledge */}
      <KnowledgeUpload onUpload={uploadKnowledge} />
      
      {/* Tool Management */}
      <ToolManager onCreateTool={createTool} />
    </div>
  );
}
```

### 2. Admin API Client

```typescript
// api/admin.ts
class AdminAPI {
  constructor(private masterKey: string) {}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.masterKey}`
    };
  }

  // API Keys
  async createKey(params: { name: string; permissions: string[] }) {
    const response = await fetch('/v1/keys', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    return response.json();
  }

  async listKeys() {
    const response = await fetch('/v1/keys', {
      headers: { 'Authorization': `Bearer ${this.masterKey}` }
    });
    return response.json();
  }

  // Tools
  async createTool(tool: CreateToolInput) {
    const response = await fetch('/v1/admin/tools', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(tool)
    });
    return response.json();
  }

  async listTools() {
    const response = await fetch('/v1/admin/tools', {
      headers: { 'Authorization': `Bearer ${this.masterKey}` }
    });
    return response.json();
  }

  // RAG
  async uploadRAG(formData: FormData) {
    const response = await fetch('/v1/rag/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.masterKey}` },
      body: formData
    });
    return response.json();
  }

  async searchRAG(tenantId: string, query: string) {
    const params = new URLSearchParams({ tenantId, query });
    const response = await fetch(`/v1/rag/search?${params}`, {
      headers: { 'Authorization': `Bearer ${this.masterKey}` }
    });
    return response.json();
  }

  // Character management
  async uploadCharacter(projectId: string, content: string) {
    // This would upload to projects/{projectId}.md
    // Implementation depends on your file storage
  }
}
```

### 3. Admin Pages

```typescript
// pages/admin/dashboard.tsx
function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>AI Agent Infrastructure Admin</h1>
      
      <section>
        <h2>Projects</h2>
        <ProjectManager />
      </section>
      
      <section>
        <h2>Knowledge Base</h2>
        <RAGManager />
      </section>
      
      <section>
        <h2>Tools</h2>
        <ToolManager />
      </section>
      
      <section>
        <h2>API Keys</h2>
        <ApiKeyManager />
      </section>
    </div>
  );
}
```

---

## Project Integration Guide (Naisu1)

### What Naisu1 Frontend Needs to Do

The Naisu1 frontend is **simple** - it just needs to:
1. Collect user input
2. Send to agent
3. Display agent response

That's it! Everything else (memory, sessions, tool calling) is handled by the agent.

### 1. Naisu1 API Client

```typescript
// api/naisu1-agent.ts
import AgentAPI from './agent';

const NAISU1_PROJECT_KEY = process.env.REACT_APP_NAISU1_KEY || 'sk-naisu1-xxxxx';
const PROJECT_ID = 'naisu1';

class Naisu1Agent {
  private api = new AgentAPI(NAISU1_PROJECT_KEY);
  private currentSessionId: string | null = null;

  async sendMessage(userWallet: string, message: string) {
    const response = await this.api.chat({
      projectId: PROJECT_ID,
      userId: userWallet,
      sessionId: this.currentSessionId || undefined,
      message
    });

    // Save session ID for continuity
    this.currentSessionId = response.sessionId;

    return response.message;
  }

  // Start new conversation
  resetConversation() {
    this.currentSessionId = null;
  }
}

export const naisu1Agent = new Naisu1Agent();
```

### 2. Chat Component

```typescript
// components/Naisu1Chat.tsx
import { useState, useEffect } from 'react';
import { naisu1Agent } from '../api/naisu1-agent';

function Naisu1Chat({ userWallet }: { userWallet: string }) {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      // Send to agent - that's it!
      const response = await naisu1Agent.sendMessage(userWallet, input);

      // Add agent response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong.' 
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="loading">Agent is thinking...</div>}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about swaps, bridges, or strategies..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Naisu1Chat;
```

### 3. Example Conversation Flow

```typescript
// User: "Hi"
// Agent: "Hello! I'm Naisu1, your DeFi assistant..."

// User: "Swap 100 USDC to ETH"
// Agent: 
//   "I'll help you swap 100 USDC to ETH. 
//    Let me prepare the transaction for you...
//    [Calls build_swap tool]
//    
//    Here's your transaction:
//    - From: 100 USDC
//    - To: ~0.041 ETH
//    - Network: Arbitrum
//    
//    Raw transaction: 0x1234...
//    
//    Please review and sign to execute."

// User: "I prefer low slippage"
// Agent: "Got it! I'll remember you prefer low slippage."
// [Saved to memory: naisu1:user-123]

// User: "Swap 50 USDC to ETH"
// Agent: 
//   "I'll prepare a swap with low slippage as you prefer.
//    [Uses remembered preference]
//    
//    Transaction ready with 0.3% slippage..."
```

### 4. Naisu1 Backend Requirements

Your Naisu1 backend just needs to expose HTTP endpoints for tools:

```typescript
// naisu1-backend/routes/tools.ts
import express from 'express';

const router = express.Router();

// Tool: build_swap
router.post('/build-swap', async (req, res) => {
  const { fromToken, toToken, amount, chain, userAddress } = req.body;

  // 1. Validate user wallet
  // 2. Get quote from DEX
  // 3. Build transaction calldata
  // 4. Return transaction data

  const transaction = await buildSwapTransaction({
    fromToken,
    toToken,
    amount,
    chain,
    userAddress
  });

  res.json({
    to: transaction.to,
    data: transaction.data,
    value: transaction.value,
    estimatedOutput: transaction.estimatedOutput,
    slippage: transaction.slippage
  });
});

// Tool: build_bridge
router.post('/build-bridge', async (req, res) => {
  // Similar implementation
});

export default router;
```

---

## Quick Reference

### Request Format

```json
{
  "projectId": "naisu1",        // Required - Project isolation
  "userId": "0x1234...",        // Required - User identity (wallet address)
  "sessionId": "sess-xxx",      // Optional - Continue conversation
  "message": "Swap 100 USDC"    // Required - User message
}
```

### Response Format

```json
{
  "ok": true,
  "sessionId": "sess-xxx",
  "message": "I'll help you swap..."
}
```

### File Locations

| Resource | Location | Example |
|----------|----------|---------|
| Character | `projects/{projectId}.md` | `projects/naisu1.md` |
| Memory | `src/data/memory.json` | - |
| Sessions | `src/data/sessions.json` | - |
| RAG | `src/data/rag-*.json` | - |
| Custom Tools | `src/data/custom-tools.json` | - |

### Environment Variables

```bash
# Agent Infrastructure
API_KEY=sk-master-xxxxx           # Master key for admin
API_KEY_REQUIRED=true             # Require auth
RATE_LIMIT_ENABLED=true           # Enable rate limiting
RATE_LIMIT_MAX_REQUESTS=10        # 10 requests/hour

# Naisu1 Frontend
REACT_APP_NAISU1_KEY=sk-naisu1-xxxxx
REACT_APP_AGENT_API_URL=http://localhost:8787

# Naisu1 Backend
NAISU1_AGENT_KEY=sk-naisu1-xxxxx  # For verifying requests
```

---

## Summary

| Component | Admin Dashboard | Naisu1 Frontend | Naisu1 Backend |
|-----------|-----------------|-----------------|----------------|
| **Purpose** | Manage infrastructure | Chat interface | Transaction building |
| **Key** | Master key | Project key | - |
| **Endpoints** | `/v1/admin/*`, `/v1/keys`, `/v1/rag/*` | `/v1/chat` | Custom tools |
| **Tasks** | Create projects, upload docs, manage tools | Send/receive messages | Execute DeFi operations |

That's it! The infrastructure handles everything else. 🎉
