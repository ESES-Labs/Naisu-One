import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useAdminChat } from "@/hooks/api";
import { AdminAPI } from "@/services/adminApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatThread {
  id: string;
  title: string;
  sessionId?: string;
  updatedAt: string;
  messages: Message[];
}

const CHAT_STORAGE_KEY = "agenthub.admin.chat.threads";

function parseThreads(raw: string | null): ChatThread[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ChatThread[];
    return parsed.map((t) => ({
      ...t,
      messages: (t.messages || []).map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

export default function Chat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isConfigured = AdminAPI.isConfigured();

  const adminChat = useAdminChat({
    onSuccess: (data) => {
      setSessionId(data.sessionId);

      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message",
      });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const saved = parseThreads(localStorage.getItem(CHAT_STORAGE_KEY));
    setThreads(saved);
    if (saved[0]) {
      setActiveThreadId(saved[0].id);
      setMessages(saved[0].messages);
      setSessionId(saved[0].sessionId);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!activeThreadId) return;
    setThreads((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages,
              sessionId,
              updatedAt: now,
              title: t.title || (messages[0]?.content?.slice(0, 36) || 'New chat'),
            }
          : t
      );
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [messages, sessionId, activeThreadId]);

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;
    if (!isConfigured) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Please set VITE_MASTER_API_KEY in your .env file",
      });
      return;
    }

    if (!activeThreadId) {
      startNewChat();
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Send message using admin API
    adminChat.mutate({
      userId: "admin-user",
      sessionId,
      message: userMsg.content,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    const id = crypto.randomUUID();
    const fresh: ChatThread = {
      id,
      title: 'New chat',
      sessionId: undefined,
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setThreads((prev) => {
      const next = [fresh, ...prev];
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setActiveThreadId(id);
    setMessages([]);
    setSessionId(undefined);
  };

  const selectThread = (thread: ChatThread) => {
    setActiveThreadId(thread.id);
    setMessages(thread.messages || []);
    setSessionId(thread.sessionId);
  };

  const clearChat = () => {
    if (!activeThreadId) return startNewChat();
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== activeThreadId);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    const remaining = threads.filter((t) => t.id !== activeThreadId);
    if (remaining[0]) {
      selectThread(remaining[0]);
    } else {
      startNewChat();
    }
    toast({ title: 'Chat cleared', description: 'Started a new conversation' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-4rem)]">
      <div className="rounded-xl border border-border bg-card p-3 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Sessions</h2>
          <Button variant="outline" size="sm" onClick={startNewChat}>New</Button>
        </div>
        <div className="space-y-2 overflow-auto">
          {threads.length === 0 && (
            <p className="text-xs text-muted-foreground">No sessions yet</p>
          )}
          {threads
            .slice()
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t)}
                className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                  activeThreadId === t.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/40'
                }`}
              >
                <p className="text-sm font-medium truncate">{t.title || 'New chat'}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {t.messages[t.messages.length - 1]?.content || 'No messages'}
                </p>
              </button>
            ))}
        </div>
      </div>

      <div className="flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Chat</h1>
          <p className="text-muted-foreground mt-1">
            Unlimited chat using admin endpoint
            {!isConfigured && (
              <span className="text-destructive ml-2">(API key not configured)</span>
            )}
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearChat}>
            Clear
          </Button>
        )}
      </div>

      {!isConfigured && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please verify server-side admin proxy configuration in Vercel env (API_BASE_URL + MASTER_API_KEY).
          </AlertDescription>
        </Alert>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto rounded-xl border border-border bg-card p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Start a conversation
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Type a message below to interact with the AI agent using the admin
              API (unlimited).
            </p>
            {sessionId && (
              <p className="text-xs text-muted-foreground mt-2">
                Session: {sessionId.slice(0, 8)}...
              </p>
            )}
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-card-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="max-w-none text-sm text-card-foreground [&_p]:m-0 [&_ul]:my-2 [&_ol]:my-2">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs pl-11">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end gap-3 pt-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isConfigured
              ? "Type a message..."
              : "Configure admin proxy to start chatting..."
          }
          className="resize-none min-h-[48px] max-h-32"
          rows={1}
          disabled={!isConfigured}
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading || !input.trim() || !isConfigured}
          size="icon"
          className="shrink-0 h-12 w-12"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      </div>
    </div>
  );
}
