'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/lib/types/database';
import ChatMarkdown from '@/components/chat/ChatMarkdown';
import { Send, Sparkles, MessageCircle, Wand2, Loader2, AlertCircle, RotateCcw, Check } from 'lucide-react';

type UiMessage = ChatMessage & { intent?: string };
type GenState = { status: 'pending' | 'done' | 'error'; error?: string };

/** Max length of an assistant message forwarded as a generation instruction. */
const MAX_INSTRUCTION_LENGTH = 1500;

/*
 * Reads the SSE stream from /api/chat-designer. See the protocol comment in
 * app/api/chat-designer/route.ts: `content` deltas, an optional `intent`
 * event (model requested a render), a `done` event carrying the final clean
 * text, or an `error` event, terminated by `[DONE]`.
 */
async function readChatStream(
  res: Response,
  onDelta: (text: string) => void
): Promise<{ content: string; intent: string | null }> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let finalContent: string | null = null;
  let intent: string | null = null;

  const handleEvent = (data: string) => {
    if (data === '[DONE]') return;
    let parsed: { content?: string; intent?: { instruction?: string }; done?: boolean; error?: string };
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }
    if (parsed.error) throw new Error(parsed.error);
    if (parsed.intent?.instruction) intent = parsed.intent.instruction;
    if (parsed.done) finalContent = parsed.content ?? content;
    else if (parsed.content) {
      content += parsed.content;
      onDelta(content);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Events are separated by a blank line; keep any partial event in the buffer.
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of event.split('\n')) {
        if (line.startsWith('data: ')) handleEvent(line.slice(6));
      }
    }
  }
  if (finalContent === null) throw new Error('The response ended unexpectedly');
  return { content: finalContent, intent };
}

export default function DesignChat({ roomId, projectId: projectIdProp }: { roomId: string; projectId?: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [projectId, setProjectId] = useState<string | undefined>(projectIdProp);
  const [historyState, setHistoryState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [error, setError] = useState<{ message: string; retryText?: string } | null>(null);
  const [genStates, setGenStates] = useState<Record<string, GenState>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    setHistoryState('loading');
    try {
      const res = await fetch(`/api/chat-designer?roomId=${encodeURIComponent(roomId)}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load chat');
      setMessages(data.messages ?? []);
      if (data.projectId) setProjectId((prev) => prev ?? data.projectId);
      setHistoryState('ready');
    } catch (err) {
      console.error('Chat history error:', err);
      setHistoryState('error');
    }
  }, [roomId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamContent, streaming, error]);

  const generate = useCallback(
    async (messageId: string, instruction: string) => {
      if (!projectId) {
        setGenStates((s) => ({ ...s, [messageId]: { status: 'error', error: 'Project not loaded yet' } }));
        return;
      }
      setGenStates((s) => ({ ...s, [messageId]: { status: 'pending' } }));
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, projectId, instruction: instruction.slice(0, MAX_INSTRUCTION_LENGTH) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.error) throw new Error(data.error || 'Generation failed');
        setGenStates((s) => ({ ...s, [messageId]: { status: 'done' } }));
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed';
        setGenStates((s) => ({ ...s, [messageId]: { status: 'error', error: message } }));
      }
    },
    [projectId, roomId, router]
  );

  const send = async (text: string, isRetry = false) => {
    if (!text || streaming) return;
    setError(null);
    setStreaming(true);
    setStreamContent('');

    if (!isRetry) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), room_id: roomId, role: 'user', content: text, created_at: new Date().toISOString() },
      ]);
    }

    try {
      const res = await fetch('/api/chat-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, roomId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Chat failed (${res.status})`);
      }
      const { content, intent } = await readChatStream(res, setStreamContent);
      const id = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id, room_id: roomId, role: 'assistant', content, created_at: new Date().toISOString(), intent: intent ?? undefined },
      ]);
      if (intent) generate(id, intent);
    } catch (err) {
      console.error('Chat error:', err);
      setError({ message: err instanceof Error ? err.message : 'Something went wrong', retryText: text });
    } finally {
      setStreamContent('');
      setStreaming(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    send(text);
  };

  return (
    <div className="flex flex-col h-[75vh] lg:h-full min-h-0 bg-surface border-t lg:border-t-0 lg:border-l border-border">
      <div className="h-12 px-md flex items-center gap-sm border-b border-border">
        <MessageCircle size={15} className="text-accent" />
        <span className="text-xs font-medium text-text-dim">Design Chat</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-md space-y-sm">
        {historyState === 'loading' && (
          <div className="flex items-center justify-center gap-xs py-xl text-text-muted text-xs">
            <Loader2 size={14} className="animate-spin" /> Loading conversation...
          </div>
        )}

        {historyState === 'error' && (
          <div className="text-center py-lg">
            <p className="text-text-dim text-xs mb-sm">Couldn&apos;t load the conversation.</p>
            <button onClick={loadHistory} className="inline-flex items-center gap-xs text-xs text-accent hover:text-accent-hover">
              <RotateCcw size={12} /> Try again
            </button>
          </div>
        )}

        {historyState === 'ready' && messages.length === 0 && !streaming && (
          <div className="text-center py-xl">
            <Sparkles size={20} className="text-accent mx-auto mb-sm" />
            <p className="text-text-dim text-sm font-medium">Ask The Architect</p>
            <p className="text-text-muted text-xs mt-1">Materials, lighting, layout...</p>
          </div>
        )}

        {messages.map((msg) => {
          const gen = genStates[msg.id];
          return (
            <div
              key={msg.id}
              className={`group p-sm rounded-lg text-sm ${
                msg.role === 'user' ? 'bg-accent/5 border border-accent/15 ml-md' : 'bg-secondary mr-md'
              }`}
            >
              <span className="block text-[10px] font-medium uppercase text-text-muted mb-0.5">
                {msg.role === 'user' ? 'You' : 'Architect'}
              </span>
              {msg.role === 'user' ? (
                <p className="text-neutral/90 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <ChatMarkdown content={msg.content} />
              )}

              {msg.role === 'assistant' && (
                <div className="mt-xs flex items-center gap-sm min-h-5">
                  {gen?.status === 'pending' ? (
                    <span className="inline-flex items-center gap-xs text-[11px] text-accent">
                      <Loader2 size={12} className="animate-spin" /> Rendering{msg.intent ? `: ${msg.intent}` : '...'}
                    </span>
                  ) : gen?.status === 'done' ? (
                    <span className="inline-flex items-center gap-xs text-[11px] text-text-dim">
                      <Check size={12} className="text-accent" /> Render started — see the canvas
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => generate(msg.id, msg.intent ?? msg.content)}
                        disabled={!projectId}
                        className={`inline-flex items-center gap-xs text-[11px] text-text-dim hover:text-accent transition-colors disabled:opacity-50 ${
                          gen?.status === 'error' ? '' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                        }`}
                      >
                        <Wand2 size={12} /> {gen?.status === 'error' ? 'Retry render' : 'Generate from this'}
                      </button>
                      {gen?.status === 'error' && (
                        <span className="inline-flex items-center gap-xs text-[11px] text-red-600">
                          <AlertCircle size={12} /> {gen.error}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {streaming && streamContent && (
          <div className="bg-secondary mr-md p-sm rounded-lg text-sm">
            <span className="block text-[10px] font-medium uppercase text-text-muted mb-0.5">Architect</span>
            <ChatMarkdown content={streamContent} />
            <span className="inline-block w-1.5 h-4 bg-accent animate-pulse mt-0.5" />
          </div>
        )}
        {streaming && !streamContent && (
          <div className="bg-secondary mr-md p-sm rounded-lg flex items-center gap-1" aria-label="The Architect is typing">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:150ms]" />
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:300ms]" />
          </div>
        )}

        {error && !streaming && (
          <div className="flex items-start gap-xs p-sm rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">
            <AlertCircle size={14} className="shrink-0 mt-px" />
            <div className="flex-1">
              <p>{error.message}</p>
              {error.retryText && (
                <button
                  onClick={() => send(error.retryText!, true)}
                  className="mt-1 inline-flex items-center gap-xs font-medium text-red-700 hover:text-red-900"
                >
                  <RotateCcw size={12} /> Retry
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-sm border-t border-border">
        <div className="flex gap-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && handleSend()}
            placeholder="Ask about materials, lighting..."
            className="flex-1 border border-border rounded-md px-sm py-1.5 text-sm text-neutral focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface placeholder:text-text-muted"
            disabled={streaming}
          />
          <button onClick={handleSend} disabled={streaming || !input.trim()} className="bg-accent text-white p-1.5 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
