# Admin Dashboard - Implementation Guide

This document describes the admin dashboard features and data flow for integrating with the AI Agent Infrastructure.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Pages & Features](#pages--features)
- [Data Flow](#data-flow)
- [API Integration Points](#api-integration-points)

---

## Overview

The Admin Dashboard is the control panel for managing the AI Agent Infrastructure. It allows administrators to create projects, manage knowledge bases, create custom tools, and monitor API keys.

### Dashboard Responsibilities

1. **Project Management** - Create and configure AI agent projects
2. **Knowledge Base** - Upload documents for RAG (Retrieval Augmented Generation)
3. **Tool Management** - Create custom tools that AI agents can use
4. **API Key Management** - Create and revoke project API keys

---

## Authentication

### Login Flow

1. Admin enters the **master API key** (from `.env` file)
2. Store the key in `localStorage` or secure storage
3. Include the key in all API requests as `Authorization: Bearer <master-key>`
4. All admin endpoints require this master key

### Protected Routes

All pages except login should check for the master key:
- If no key → redirect to login
- If key exists → allow access to dashboard

---

## Pages & Features

### 1. Dashboard Overview

**Purpose:** High-level stats and quick actions

**Features:**
- Stats cards showing:
  - Total API keys (projects)
  - Total custom tools
  - Total documents in RAG
  - System health status
- Quick action buttons:
  - Create new project
  - Upload document
  - Create tool

**Data Sources:**
- `GET /v1/keys` - Count API keys
- `GET /v1/admin/tools` - Count custom tools
- `GET /health` - System status

---

### 2. Projects Management

**Purpose:** Create and manage AI agent projects

**Features:**

#### List Projects
- Display all API keys as projects
- Show project name, key prefix, creation date
- Actions: View details, Delete

#### Create Project
Flow:
1. Admin fills form:
   - Project name (e.g., "Naisu1")
   - Character/system prompt (markdown)
2. On submit:
   - Call `POST /v1/keys` to create API key
   - Save character to `projects/{projectId}.md` (via file API or git)
3. Show the generated API key (**only once**)
4. Project is ready to use

#### Project Character
- Character file defines the AI's personality
- Stored in `projects/{projectId}.md`
- Loaded by agent when processing chat requests
- Can be edited after creation

---

### 3. Knowledge Base (RAG)

**Purpose:** Manage documents for AI retrieval

**Features:**

#### Upload Documents
Supported formats: PDF, DOCX, TXT, MD

Flow:
1. Select project (tenantId) from dropdown
2. Drag & drop or select files
3. Upload via `POST /v1/rag/upload` (multipart/form-data)
4. Show upload progress and parsed metadata
5. Document is chunked and indexed automatically

#### Search Knowledge Base
Flow:
1. Select project
2. Enter search query
3. Call `GET /v1/rag/search?tenantId={id}&query={text}`
4. Display search results with relevance scores

#### Document List
- List all documents per project
- Show metadata: filename, type, size, chunks
- Actions: Delete document

---

### 4. Tools Management

**Purpose:** Create custom tools for AI agents

**Features:**

#### List Tools
- Show built-in tools (read-only)
- Show custom tools with edit/delete actions
- Display tool status (active/inactive)

#### Create Tool

Two types of tools:

**A. HTTP Tool** - Calls external API

Required fields:
- Name (e.g., `build_swap`)
- Description (when to use this tool)
- Parameters (name, type, description, required)
- HTTP Config:
  - URL with `{{param}}` placeholders
  - Method (GET, POST, PUT, etc.)
  - Headers (optional)
  - Body template with `{{param}}` placeholders (for POST/PUT)

Example URL: `https://api.example.com/swap?from={{fromToken}}&to={{toToken}}`

**B. Code Tool** - Executes JavaScript

Required fields:
- Name
- Description
- Parameters
- JavaScript code

The code runs in a sandbox with access to:
- `args` - parameter values
- `fetch` - HTTP requests
- `console.log/error` - logging
- Basic JS utilities (JSON, Math, Date, etc.)

---

### 5. API Keys Management

**Purpose:** Manage project API keys

**Features:**

#### List Keys
- Show all API keys
- Display: name, prefix, permissions, status, created date
- Actions: Revoke, Activate, Delete

#### Create Key
Flow:
1. Enter key name
2. Select permissions (checkboxes):
   - `chat:write` - Send chat messages
   - `tools:execute` - Execute tools
   - `rag:read` - Search knowledge base (admin only)
3. Optional: Set expiration date
4. Submit via `POST /v1/keys`
5. **Display full key only once** - store it securely

#### Revoke/Activate
- Revoked keys cannot be used but remain in list
- Can re-activate revoked keys

#### Delete
- Permanently removes the key

---

## Data Flow

### Creating a New Project (e.g., Naisu1)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Dashboard │────▶│  Agent Infra API │────▶│  File System    │
│                 │     │                  │     │                 │
│ 1. Fill form:   │     │ 1. POST /v1/keys │     │ Save character  │
│    - Name       │     │    Create API key│     │ to projects/    │
│    - Character  │     │                  │     │ naisu1.md       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        │                        ▼
        │               Return API key
        │               (show once to admin)
        │
        ▼
Project ready for use!
```

### Uploading Knowledge Base

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Dashboard │────▶│  Agent Infra API │────▶│  RAG Processor  │
│                 │     │                  │     │                 │
│ 1. Select file  │     │ 1. Parse file    │     │ 1. Chunk text   │
│ 2. Select proj  │────▶│ 2. Extract text  │────▶│ 2. Generate     │
│ 3. Upload       │     │ 3. Store chunks  │     │    embeddings   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Creating a Custom Tool

```
┌─────────────────┐     ┌──────────────────┐
│  Admin Dashboard │────▶│  Agent Infra API │
│                 │     │                  │
│ 1. Define tool  │     │ 1. Validate tool │
│    - Name       │────▶│ 2. Store config  │
│    - Params     │     │ 3. Make available│
│    - HTTP/Code  │     │    to all agents │
└─────────────────┘     └──────────────────┘
```

---

## API Integration Points

### Required API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Check system status |
| `GET` | `/v1/keys` | List all API keys |
| `POST` | `/v1/keys` | Create new API key |
| `POST` | `/v1/keys/:id/revoke` | Revoke a key |
| `POST` | `/v1/keys/:id/activate` | Activate revoked key |
| `DELETE` | `/v1/keys/:id` | Delete a key |
| `GET` | `/v1/admin/tools` | List all tools |
| `POST` | `/v1/admin/tools` | Create new tool |
| `PUT` | `/v1/admin/tools/:id` | Update tool |
| `DELETE` | `/v1/admin/tools/:id` | Delete tool |
| `POST` | `/v1/rag/upload` | Upload document |
| `GET` | `/v1/rag/search` | Search knowledge base |

### Authentication Header

All requests (except `/health`) require:
```
Authorization: Bearer <master-api-key>
```

### File Upload Format

For RAG document upload:
```
POST /v1/rag/upload
Content-Type: multipart/form-data
Authorization: Bearer <master-key>

Form fields:
- file: <binary file data>
- tenantId: <project-id>
- metadata: {"key": "value"} (optional)
```

### Character File Storage

Character files should be stored at:
```
projects/{projectId}.md
```

The infrastructure reads these files when processing chat requests for the project.

---

## Key Workflows

### 1. Onboard New Project (like Naisu1)

1. Go to Projects page
2. Click "New Project"
3. Fill:
   - Name: "Naisu1"
   - Character: Markdown with DeFi agent personality
4. Submit → Creates API key + character file
5. Copy the API key (shown once)
6. Go to RAG page → Upload DeFi documentation
7. Go to Tools page → Create `build_swap`, `build_bridge` tools
8. Give the API key to Naisu1 frontend team

### 2. Add Knowledge to Existing Project

1. Go to RAG page
2. Select project from dropdown
3. Drag & drop documents
4. Documents are automatically parsed and indexed
5. AI agent can now retrieve this information

### 3. Update Project Character

1. Go to Projects page
2. Find project → Click Edit
3. Modify the character markdown
4. Save → Updates `projects/{id}.md`
5. New chats immediately use updated character

---

## Notes

- All operations are **project-scoped** except tool creation (tools are global)
- The master key has **unlimited access** to all endpoints
- API keys created for projects are **restricted** to chat/tools only
- Document upload is **async** - parsing may take a few seconds
- Character files are **hot-reloaded** - no server restart needed
