import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { MemoryProvider } from "../memory/provider.js";
import type { SessionProvider } from "../session/provider.js";
import type { ToolRegistry } from "./tool-registry.js";

export function buildToolkit(params: {
  projectId: string;
  userId: string;
  sessionId: string;
  memory: MemoryProvider;
  sessions: SessionProvider;
  toolRegistry?: ToolRegistry;
}) {
  const { projectId, userId, sessionId, memory, sessions, toolRegistry } = params;

  const memorySave = new DynamicStructuredTool({
    name: "memory_save",
    description: "Save long-term user memory such as preferences or facts.",
    schema: z.object({ text: z.string().min(2), tags: z.array(z.string()).default([]) }),
    func: async ({ text, tags }) => JSON.stringify(await memory.upsert(projectId, userId, text, tags))
  });

  const memorySearch = new DynamicStructuredTool({
    name: "memory_search",
    description: "Semantic search in long-term memory.",
    schema: z.object({ query: z.string().min(1), limit: z.number().int().positive().max(10).default(5) }),
    func: async ({ query, limit }) => JSON.stringify(await memory.semanticSearch(projectId, userId, query, limit))
  });

  const contextGet = new DynamicStructuredTool({
    name: "context_get",
    description: "Read recent session context.",
    schema: z.object({ limit: z.number().int().positive().max(20).default(10) }),
    func: async ({ limit }) => JSON.stringify(sessions.getRecentContext(sessionId, limit))
  });

  const now = new DynamicStructuredTool({
    name: "time_now",
    description: "Get current ISO datetime (UTC).",
    schema: z.object({}),
    func: async () => new Date().toISOString()
  });

  const tools: DynamicStructuredTool[] = [memorySave, memorySearch, contextGet, now];

  // Add custom tools from registry
  if (toolRegistry) {
    const { custom } = toolRegistry.getAllTools();
    for (const customTool of custom) {
      if (customTool.isActive) {
        try {
          const executableTool = toolRegistry.createExecutableTool(
            customTool,
            memory,
            sessions
          );
          tools.push(executableTool);
        } catch (error) {
          console.error(`Failed to load custom tool: ${customTool.name}`, error);
        }
      }
    }
  }

  return tools;
}
