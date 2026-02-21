# Agent Infra API Documentation

Complete API reference for integrating with the Agent Infra backend.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Public Endpoints](#public-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Frontend Integration Guide](#frontend-integration-guide)

---

## Base URL

```
Development: http://localhost:8787
Production:  https://your-domain.com
```

All endpoints are prefixed with `/v1` unless otherwise specified.

---

## Authentication

### Public Endpoints (No Auth Required)

- `GET /health` - Health check
- `GET /v1/rate-limit` - Check rate limit status

### Public Endpoints (Rate Limited)

- `POST /v1/chat` - Anonymous chat (rate limited by device)

### Admin Endpoints (Master Key Required)

All admin endpoints require the master API key:

```http
Authorization: Bearer sk-your-master-key
```

Admin endpoints:
- `POST /v1/admin/chat` - Unlimited chat
- `GET /v1/admin/tools` - List all tools
- `POST /v1/admin/tools` - Create custom tool
- `GET /v1/admin/tools/:id` - Get tool details
- `PUT /v1/admin/tools/:id` - Update custom tool
- `DELETE /v1/admin/tools/:id` - Delete custom tool
- `POST /v1/rag/ingest` - Knowledge base management
- `GET /v1/rag/jobs/:jobId` - Check RAG job status
- `GET /v1/rag/search` - Search knowledge base
- `GET /v1/keys` - List API keys
- `POST /v1/keys` - Create API key
- `POST /v1/keys/:id/revoke` - Revoke API key
- `POST /v1/keys/:id/activate` - Activate API key
- `DELETE /v1/keys/:id` - Delete API key

---

## Rate Limiting

### For Public Endpoints

Rate limiting is applied to anonymous users based on:
1. **Device ID** (recommended) - Sent via `X-Device-ID` header
2. **IP Address** (fallback) - If no device ID provided

### Default Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /v1/chat` | 10 requests | 1 hour (3600s) |

### Rate Limit Headers

All responses include rate limit headers:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1708537211
```

### Rate Limit Response (429)

When limit exceeded:

```json
{
  "ok": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again after 2026-02-21T20:10:11.828Z",
  "retryAfter": 3542,
  "limit": 10,
  "windowSeconds": 3600
}
```

---

## Public Endpoints

### Health Check

Check if the service is running.

```http
GET /health
```

**Response:**

```json
{
  "ok": true,
  "service": "agent-infra-langchain-ts",
  "llmProvider": "heurist",
  "oauthEnabled": false,
  "apiKeyRequired": false,
  "apiKeyConfigured": false,
  "managedKeys": 0,
  "rateLimitingEnabled": true,
  "rateLimitConfig": {
    "maxRequests": 10,
    "windowSeconds": 3600
  }
}
```

---

### Check Rate Limit Status

Get current rate limit status for your device.

```http
GET /v1/rate-limit
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Device-ID` | No | Unique device identifier (generates new window if not provided) |

**Response:**

```json
{
  "ok": true,
  "rateLimitingEnabled": true,
  "limit": 10,
  "remaining": 8,
  "resetAt": "2026-02-21T20:10:11.828Z",
  "resetInSeconds": 3542
}
```

---

### Public Chat (Rate Limited)

Send a chat message. Rate limited to 10 requests per hour per device.

```http
POST /v1/chat
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `X-Device-ID` | No | Recommended for consistent rate limiting |

**Request Body:**

```json
{
  "projectId": "naisu1",
  "userId": "user-123",
  "sessionId": "session-456",
  "message": "Hello, how are you?"
}
```

**Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `projectId` | string | Yes | `"default"` | Project identifier for isolation (e.g., `naisu1`) |
| `userId` | string | Yes | - | Unique user identifier (e.g., wallet address) |
| `sessionId` | string | No | - | Existing session ID for conversation continuity |
| `message` | string | Yes | - | User's message |

**Multi-Tenancy:**
- **Project Isolation**: Each `projectId` has its own character, tools, and RAG knowledge
- **User Isolation**: Users within a project can't see each other's memories
- **Session Continuity**: Pass the same `sessionId` to continue a conversation

**Response (Success):**

```json
{
  "ok": true,
  "sessionId": "a8d4cd23-bc9f-44c3-88de-1bce2bd36919",
  "message": "Hello! I'm doing well, thank you for asking. How can I help you today?"
}
```

**Response (Rate Limited):**

```json
{
  "ok": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again after 2026-02-21T20:10:11.828Z",
  "retryAfter": 3542,
  "limit": 10,
  "windowSeconds": 3600
}
```

---

## Admin Endpoints

All admin endpoints require master key authentication.

### Admin Chat (Unlimited)

Send a chat message without rate limits. Requires master key.

```http
POST /v1/admin/chat
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Request Body:**

Same as public chat endpoint.

```json
{
  "projectId": "naisu1",
  "userId": "admin-user",
  "sessionId": "admin-session",
  "message": "Hello from admin"
}
```

**Response:**

```json
{
  "ok": true,
  "sessionId": "a8d4cd23-bc9f-44c3-88de-1bce2bd36919",
  "message": "Hello! How can I assist you today?"
}
```

**Error Response (No Auth):**

```json
{
  "ok": false,
  "error": "Forbidden - Admin access required",
  "message": "Only the master API key can access admin endpoints"
}
```

---

### List API Keys

Get all managed API keys.

```http
GET /v1/keys
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "keys": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "keyPrefix": "sk-abcd...",
      "name": "Production App",
      "description": "Main production API key",
      "permissions": ["chat:write", "tools:read"],
      "createdAt": "2026-02-21T10:00:00.000Z",
      "expiresAt": "2027-02-21T10:00:00.000Z",
      "isActive": true
    }
  ]
}
```

---

### Create API Key

Create a new managed API key.

```http
POST /v1/keys
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Request Body:**

```json
{
  "name": "Mobile App",
  "description": "API key for mobile application",
  "permissions": ["chat:write"],
  "expiresInDays": 90
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the API key |
| `description` | string | No | Description |
| `permissions` | string[] | No | Array of permissions (default: `["chat:write"]`) |
| `expiresInDays` | number | No | Expiration in days (default: never) |

**Available Permissions:**

- `chat:write` - Send chat messages
- `tools:read` - List tools
- `tools:execute` - Execute tools
- `rag:read` - Search knowledge base (admin only)
- `admin:keys` - Manage API keys (admin only)
- `*` - All permissions

**Response:**

```json
{
  "ok": true,
  "key": "sk-new-api-key-full-string",
  "apiKey": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "keyPrefix": "sk-efgh...",
    "name": "Mobile App",
    "description": "API key for mobile application",
    "permissions": ["chat:write"],
    "createdAt": "2026-02-21T15:30:00.000Z",
    "expiresAt": "2026-05-22T15:30:00.000Z",
    "isActive": true
  }
}
```

**⚠️ Important:** The full `key` is only returned once. Store it securely.

---

### Revoke API Key

Deactivate an API key (can be reactivated later).

```http
POST /v1/keys/:id/revoke
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "message": "API key revoked"
}
```

---

### Activate API Key

Reactivate a revoked API key.

```http
POST /v1/keys/:id/activate
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "message": "API key activated"
}
```

---

### Delete API Key

Permanently delete an API key.

```http
DELETE /v1/keys/:id
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "message": "API key deleted"
}
```

---

### Ingest Document (RAG)

Add content to the knowledge base.

```http
POST /v1/rag/ingest
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Request Body:**

```json
{
  "tenantId": "default",
  "source": "documentation.md",
  "content": "# Documentation\n\nThis is the content...",
  "metadata": {
    "category": "docs",
    "version": "1.0"
  }
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantId` | string | Yes | Tenant/namespace identifier |
| `source` | string | Yes | Source document name |
| `content` | string | Yes | Document content |
| `metadata` | object | No | Additional metadata |

**Response:**

```json
{
  "ok": true,
  "jobId": "job-123",
  "status": "pending"
}
```

---

### Check RAG Job Status

Check the status of a document ingestion job.

```http
GET /v1/rag/jobs/:jobId
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "job": {
    "id": "job-123",
    "tenantId": "default",
    "source": "documentation.md",
    "status": "completed",
    "chunks": 5,
    "createdAt": "2026-02-21T15:30:00.000Z",
    "completedAt": "2026-02-21T15:30:05.000Z"
  }
}
```

---

### Search Knowledge Base

Search the RAG knowledge base.

```http
GET /v1/rag/search?tenantId=default&query=how+to+install&limit=5
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tenantId` | string | Yes | - | Tenant identifier |
| `query` | string | Yes | - | Search query |
| `limit` | number | No | 5 | Max results to return |

**Response:**

```json
{
  "ok": true,
  "items": [
    {
      "id": "chunk-1",
      "content": "To install, run npm install...",
      "source": "documentation.md",
      "score": 0.95,
      "metadata": {
        "category": "docs"
      }
    }
  ]
}
```

---

### List All Tools

Get all available tools (built-in + custom).

```http
GET /v1/admin/tools
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "tools": {
    "builtin": [
      {
        "name": "memory_save",
        "description": "Save long-term user memory such as preferences or facts.",
        "schema": {
          "type": "object",
          "properties": {
            "text": { "type": "string", "description": "" },
            "tags": { "type": "array", "description": "" }
          },
          "required": ["text"]
        }
      }
    ],
    "custom": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "weather_lookup",
        "description": "Get weather information for a location",
        "parameters": [
          {
            "name": "city",
            "type": "string",
            "description": "City name",
            "required": true
          }
        ],
        "execution": {
          "type": "http",
          "url": "https://api.weather.com/v1/current?city={{city}}",
          "method": "GET",
          "timeoutMs": 10000
        },
        "isActive": true,
        "createdAt": "2026-02-21T15:30:00.000Z",
        "updatedAt": "2026-02-21T15:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Tool Details

Get details of a specific custom tool.

```http
GET /v1/admin/tools/:id
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "tool": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "weather_lookup",
    "description": "Get weather information for a location",
    "parameters": [
      {
        "name": "city",
        "type": "string",
        "description": "City name",
        "required": true
      }
    ],
    "execution": {
      "type": "http",
      "url": "https://api.weather.com/v1/current?city={{city}}",
      "method": "GET",
      "timeoutMs": 10000
    },
    "isActive": true,
    "createdAt": "2026-02-21T15:30:00.000Z",
    "updatedAt": "2026-02-21T15:30:00.000Z"
  }
}
```

---

### Create Custom Tool

Create a new custom tool that the AI can use.

```http
POST /v1/admin/tools
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Request Body:**

```json
{
  "name": "weather_lookup",
  "description": "Get weather information for a location. Use this when users ask about weather.",
  "parameters": [
    {
      "name": "city",
      "type": "string",
      "description": "City name",
      "required": true
    },
    {
      "name": "units",
      "type": "string",
      "description": "Temperature units",
      "required": false,
      "default": "celsius"
    }
  ],
  "execution": {
    "type": "http",
    "url": "https://api.weather.com/v1/current?city={{city}}&units={{units}}",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {{API_KEY}}"
    },
    "timeoutMs": 10000
  }
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tool name (letters, numbers, underscores, hyphens; must start with letter) |
| `description` | string | Yes | Description shown to AI (be clear about when to use) |
| `parameters` | array | Yes | Tool parameters |
| `execution` | object | Yes | Execution configuration |

**Parameter Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Parameter name |
| `type` | string | Yes | Parameter type: `string`, `number`, `boolean`, `array`, `object` |
| `description` | string | Yes | Description for the AI |
| `required` | boolean | Yes | Whether parameter is required |
| `default` | any | No | Default value if not provided |

**Execution Types:**

**HTTP Execution:**

```json
{
  "type": "http",
  "url": "https://api.example.com/endpoint?param={{paramName}}",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer {{token}}"
  },
  "bodyTemplate": "{\"key\": {{value}}}",
  "timeoutMs": 30000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"http"` |
| `url` | string | Yes | URL with `{{param}}` placeholders |
| `method` | string | No | HTTP method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` (default: `GET`) |
| `headers` | object | No | Headers with `{{param}}` placeholders |
| `bodyTemplate` | string | No | Request body template with `{{param}}` placeholders |
| `timeoutMs` | number | No | Request timeout in ms (default: `30000`, max: `60000`) |

**Code Execution:**

```json
{
  "type": "code",
  "code": "// JavaScript code\nconst result = {\n  greeting: `Hello, ${args.name}!`,\n  timestamp: new Date().toISOString()\n};\nreturn result;"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"code"` |
| `code` | string | Yes | JavaScript code to execute |

**⚠️ Security Warning:** Code execution runs in a sandbox but should only be used for trusted code.

**Response:**

```json
{
  "ok": true,
  "tool": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "weather_lookup",
    "description": "Get weather information for a location...",
    "parameters": [...],
    "execution": { ... },
    "isActive": true,
    "createdAt": "2026-02-21T15:30:00.000Z",
    "updatedAt": "2026-02-21T15:30:00.000Z"
  }
}
```

---

### Update Custom Tool

Update an existing custom tool.

```http
PUT /v1/admin/tools/:id
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Request Body:**

Same as create, but all fields are optional. Only provided fields are updated.

```json
{
  "description": "Updated description",
  "isActive": false
}
```

**Response:**

```json
{
  "ok": true,
  "tool": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "weather_lookup",
    "description": "Updated description",
    ...
  }
}
```

---

### Delete Custom Tool

Permanently delete a custom tool.

```http
DELETE /v1/admin/tools/:id
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <master-api-key>` |

**Response:**

```json
{
  "ok": true,
  "message": "Tool deleted successfully"
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request

Invalid request body or parameters.

```json
{
  "ok": false,
  "error": {
    "formErrors": [],
    "fieldErrors": {
      "userId": ["Required"],
      "message": ["Required"]
    }
  }
}
```

#### 401 Unauthorized

Missing or invalid API key.

```json
{
  "ok": false,
  "error": "Unauthorized - Invalid API key"
}
```

#### 403 Forbidden

Valid key but insufficient permissions.

```json
{
  "ok": false,
  "error": "Forbidden - Admin access required",
  "message": "Only the master API key can access admin endpoints"
}
```

#### 404 Not Found

Resource not found.

```json
{
  "ok": false,
  "error": "API key not found"
}
```

#### 429 Too Many Requests

Rate limit exceeded.

```json
{
  "ok": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again after 2026-02-21T20:10:11.828Z",
  "retryAfter": 3542,
  "limit": 10,
  "windowSeconds": 3600
}
```

#### 500 Internal Server Error

Server error.

```json
{
  "ok": false,
  "error": "Internal server error",
  "details": "Error message"
}
```

---

## Frontend Integration Guide

### 1. Anonymous User Flow (Public Chat)

```javascript
// utils/device.js
const DEVICE_ID_KEY = 'ai_device_id';

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8787';

export async function checkRateLimit() {
  const deviceId = getDeviceId();
  
  const response = await fetch(`${API_BASE_URL}/v1/rate-limit`, {
    headers: {
      'X-Device-ID': deviceId
    }
  });
  
  return response.json();
}

// For project-based agents (like Naisu1)
export async function sendChatMessage({ projectId, userId, message, sessionId = null, apiKey = null }) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization if API key provided
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/v1/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      projectId,  // Project isolation (e.g., "naisu1")
      userId,     // User identity (e.g., wallet address)
      sessionId,  // Optional: continue conversation
      message
    })
  });
  
  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining');
  console.log(`Remaining requests: ${remaining}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited
      const minutes = Math.ceil(data.retryAfter / 60);
      throw new Error(`Rate limit exceeded. Try again in ${minutes} minutes.`);
    }
    throw new Error(data.error?.message || 'Request failed');
  }
  
  return data;
}

// components/Chat.jsx
import { useState, useEffect } from 'react';
import { checkRateLimit, sendChatMessage, getDeviceId } from '../utils/api';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);
  const [error, setError] = useState(null);

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit().then(data => {
      if (data.ok) {
        setRateLimit(data);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendChatMessage({
        projectId: 'naisu1',  // Your project ID
        userId: deviceId,     // User's wallet address or ID
        message: input,
        sessionId,
        apiKey: process.env.REACT_APP_NAISU1_KEY  // Project API key
      });
      
      // Save session ID for continuity
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      
      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message
      }]);
      
      // Update rate limit
      setRateLimit(prev => ({
        ...prev,
        remaining: Math.max(0, prev.remaining - 1)
      }));
      
    } catch (err) {
      setError(err.message);
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="chat-container">
      {rateLimit && (
        <div className="rate-limit-indicator">
          Remaining: {rateLimit.remaining}/{rateLimit.limit}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={rateLimit?.remaining === 0}
        />
        <button type="submit" disabled={rateLimit?.remaining === 0}>
          Send
        </button>
      </form>
    </div>
  );
}
```

---

### 2. Admin Dashboard Integration

```javascript
// utils/adminApi.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8787';

class AdminAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  // Admin chat (unlimited) - can access any project
  async sendChat(projectId, message, sessionId = null, userId = 'admin') {
    const response = await fetch(`${API_BASE_URL}/v1/admin/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        projectId,
        userId,
        sessionId,
        message
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // List all API keys
  async listKeys() {
    const response = await fetch(`${API_BASE_URL}/v1/keys`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // List all tools (built-in + custom)
  async listTools() {
    const response = await fetch(`${API_BASE_URL}/v1/admin/tools`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Create custom tool
  async createTool({ name, description, parameters, execution }) {
    const response = await fetch(`${API_BASE_URL}/v1/admin/tools`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name,
        description,
        parameters,
        execution
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Update custom tool
  async updateTool(toolId, updates) {
    const response = await fetch(`${API_BASE_URL}/v1/admin/tools/${toolId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Delete custom tool
  async deleteTool(toolId) {
    const response = await fetch(`${API_BASE_URL}/v1/admin/tools/${toolId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Create new API key
  async createKey({ name, description, permissions, expiresInDays }) {
    const response = await fetch(`${API_BASE_URL}/v1/keys`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name,
        description,
        permissions,
        expiresInDays
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Revoke API key
  async revokeKey(keyId) {
    const response = await fetch(`${API_BASE_URL}/v1/keys/${keyId}/revoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Ingest document to RAG
  async ingestDocument(tenantId, source, content, metadata = {}) {
    const response = await fetch(`${API_BASE_URL}/v1/rag/ingest`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        tenantId,
        source,
        content,
        metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Search knowledge base
  async searchRAG(tenantId, query, limit = 5) {
    const params = new URLSearchParams({ tenantId, query, limit: String(limit) });
    
    const response = await fetch(`${API_BASE_URL}/v1/rag/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }
}

export default AdminAPI;

// components/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import AdminAPI from '../utils/adminApi';

function AdminDashboard({ apiKey }) {
  const [api] = useState(() => new AdminAPI(apiKey));
  const [keys, setKeys] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // Load API keys on mount
  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const data = await api.listKeys();
      setKeys(data.keys);
    } catch (err) {
      console.error('Failed to load keys:', err);
    }
  }

  async function handleCreateKey(formData) {
    try {
      const result = await api.createKey(formData);
      alert(`New API Key: ${result.key}\n\nCopy this now - it won't be shown again!`);
      loadKeys();
    } catch (err) {
      alert('Failed to create key: ' + err.message);
    }
  }

  async function handleChat(message) {
    try {
      const result = await api.sendChat(message, sessionId);
      setSessionId(result.sessionId);
      setChatMessages(prev => [...prev, 
        { role: 'user', content: message },
        { role: 'assistant', content: result.message }
      ]);
    } catch (err) {
      alert('Chat failed: ' + err.message);
    }
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Admin Chat - Unlimited */}
      <section>
        <h2>Admin Chat (Unlimited)</h2>
        <ChatInterface 
          messages={chatMessages}
          onSend={handleChat}
        />
      </section>

      {/* Tool Management */}
      <section>
        <h2>Custom Tools</h2>
        <ToolManager api={api} />
      </section>

      {/* API Key Management */}
      <section>
        <h2>API Keys</h2>
        <ApiKeyList keys={keys} onRevoke={api.revokeKey} />
        <CreateKeyForm onSubmit={handleCreateKey} />
      </section>

      {/* RAG Management */}
      <section>
        <h2>Knowledge Base</h2>
        <RAGManager api={api} />
      </section>
    </div>
  );
}
```

---

### 3. Environment Configuration

```bash
# .env (Frontend)

# Development
REACT_APP_API_URL=http://localhost:8787

# Production
REACT_APP_API_URL=https://api.your-domain.com
```

---

## Best Practices

### 1. **Device ID Persistence**

Store device ID in `localStorage` or `IndexedDB` to maintain consistent rate limiting across sessions:

```javascript
// Good: Persistent device ID
const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
localStorage.setItem('device_id', deviceId);
```

### 2. **Rate Limit Pre-flight**

Check rate limit status before allowing user to type:

```javascript
async function canSendMessage() {
  const status = await checkRateLimit();
  return status.remaining > 0;
}
```

### 3. **Session Continuity**

Save `sessionId` to maintain conversation context:

```javascript
// Save to localStorage
localStorage.setItem('chat_session_id', response.sessionId);

// Load on app start
const savedSession = localStorage.getItem('chat_session_id');
```

### 4. **Error Handling**

Always handle rate limit errors gracefully:

```javascript
try {
  const response = await sendChatMessage({
    projectId: 'naisu1',
    userId: walletAddress,
    message: userInput,
    apiKey: NAISU1_API_KEY
  });
} catch (err) {
  if (err.message.includes('Rate limit')) {
    // Show upgrade prompt or wait timer
    showRateLimitMessage(err.message);
  } else {
    showGenericError(err.message);
  }
}
```

### 5. **Security**

- Never expose the **master API key** in frontend code
- Use managed API keys with limited permissions for specific features
- Rotate keys regularly (set expiration dates)

---

## Quick Reference

| Task | Endpoint | Auth |
|------|----------|------|
| Check health | `GET /health` | None |
| Check quota | `GET /v1/rate-limit` | None |
| Public chat | `POST /v1/chat` | Device ID |
| Admin chat | `POST /v1/admin/chat` | Master key |
| List tools | `GET /v1/admin/tools` | Master key |
| Create tool | `POST /v1/admin/tools` | Master key |
| Update tool | `PUT /v1/admin/tools/:id` | Master key |
| Delete tool | `DELETE /v1/admin/tools/:id` | Master key |
| List keys | `GET /v1/keys` | Master key |
| Create key | `POST /v1/keys` | Master key |
| Ingest doc | `POST /v1/rag/ingest` | Master key |
| Search RAG | `GET /v1/rag/search` | Master key |
