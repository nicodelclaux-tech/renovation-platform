'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types/database';
import { Send, Sparkles, MessageSquare } from 'lucide-react';

export default function DesignChat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    loadHistory();
  }, [roomId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamContent]);

  const handleSend = async () => {
    if (!input.trim() || streaming) return;
    const userMessage = input.trim();
    setInput('');
    setStreaming(true);
    setStreamContent('');

    // Optimistic add user message
    const tempUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      room_id: roomId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, roomId }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamContent(fullContent);
                }
              } catch {}
            }
          }
        }
      }

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        room_id: roomId,
        role: 'assistant',
        content: fullContent,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamContent('');
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary/30 border-l border-border">
      {/* Header */}
      <div className="p-md border-b border-border flex items-center gap-sm">
        <MessageSquare size={16} className="text-accent" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim">Design Intelligence</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-md space-y-md">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-lg">
            <Sparkles size={24} className="text-accent mx-auto mb-sm" />
            <p className="text-text-dim text-sm">Ask The Architect about your design</p>
            <p className="text-text-dim/60 text-xs mt-xs">Materials, lighting, layout, style references...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-sm rounded-lg text-sm ${
              msg.role === 'user'
                ? 'bg-accent/10 border border-accent/20 ml-lg'
                : 'bg-primary/60 border border-border mr-lg'
            }`}
          >
            <span className="block text-[9px] font-mono uppercase text-text-dim/60 mb-xs">
              {msg.role === 'user' ? 'You' : 'The Architect'}
            </span>
            <p className="text-neutral/90 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {/* Streaming indicator */}
        {streaming && streamContent && (
          <div className="bg-primary/60 border border-border mr-lg p-sm rounded-lg text-sm">
            <span className="block text-[9px] font-mono uppercase text-text-dim/60 mb-xs">The Architect</span>
            <p className="text-neutral/90 whitespace-pre-wrap">{streamContent}</p>
            <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5" />
          </div>
        )}

        {streaming && !streamContent && (
          <div className="bg-primary/60 border border-border mr-lg p-sm rounded-lg">
            <div className="flex items-center gap-xs">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-100" />
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-md border-t border-border">
        <div className="flex gap-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about materials, lighting, layout..."
            className="flex-1 bg-primary border border-border rounded-md px-sm py-xs text-sm text-neutral focus:outline-none focus:border-accent"
            disabled={streaming}
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className="bg-accent text-neutral p-xs rounded-md hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
