'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types/database';
import { Send, Sparkles, MessageCircle } from 'lucide-react';

export default function DesignChat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    loadHistory();
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamContent]);

  const handleSend = async () => {
    if (!input.trim() || streaming) return;
    const userMessage = input.trim();
    setInput('');
    setStreaming(true);
    setStreamContent('');

    const tempUserMsg: ChatMessage = { id: crypto.randomUUID(), room_id: roomId, role: 'user', content: userMessage, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat-designer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage, roomId }) });
      if (!res.ok) throw new Error('Chat failed');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          for (const line of text.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try { const parsed = JSON.parse(data); if (parsed.content) { fullContent += parsed.content; setStreamContent(fullContent); } } catch {}
            }
          }
        }
      }
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), room_id: roomId, role: 'assistant', content: fullContent, created_at: new Date().toISOString() }]);
      setStreamContent('');
    } catch (err) { console.error('Chat error:', err); }
    finally { setStreaming(false); }
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border">
      <div className="h-12 px-md flex items-center gap-sm border-b border-border">
        <MessageCircle size={15} className="text-accent" />
        <span className="text-xs font-medium text-text-dim">Design Chat</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-md space-y-sm">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-xl">
            <Sparkles size={20} className="text-accent mx-auto mb-sm" />
            <p className="text-text-dim text-sm font-medium">Ask The Architect</p>
            <p className="text-text-muted text-xs mt-1">Materials, lighting, layout...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`p-sm rounded-lg text-sm ${
            msg.role === 'user' ? 'bg-accent/5 border border-accent/15 ml-md' : 'bg-secondary mr-md'
          }`}>
            <span className="block text-[10px] font-medium uppercase text-text-muted mb-0.5">
              {msg.role === 'user' ? 'You' : 'Architect'}
            </span>
            <p className="text-neutral/90 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ))}

        {streaming && streamContent && (
          <div className="bg-secondary mr-md p-sm rounded-lg text-sm">
            <span className="block text-[10px] font-medium uppercase text-text-muted mb-0.5">Architect</span>
            <p className="text-neutral/90 whitespace-pre-wrap leading-relaxed">{streamContent}<span className="inline-block w-1.5 h-4 bg-accent animate-pulse ml-0.5" /></p>
          </div>
        )}
        {streaming && !streamContent && (
          <div className="bg-secondary mr-md p-sm rounded-lg flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:150ms]" />
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:300ms]" />
          </div>
        )}
      </div>

      <div className="p-sm border-t border-border">
        <div className="flex gap-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
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
