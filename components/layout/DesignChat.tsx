
'use client'

import { useState } from 'react'

export default function DesignChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Listo para transformar el espacio. Mantendré las columnas y molduras originales. ¿Qué cambios de suelo o color de pared tienes en mente?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    const newMsg = { role: 'user', content: input }
    setMessages([...messages, newMsg])
    setInput('')
    // Aquí conectaremos con /api/generate-image o un nuevo endpoint de Chat AI
  }

  return (
    <div className="flex flex-col h-full bg-obsidian-900 border-l border-white/10 w-80">
      <div className="p-4 border-b border-white/10 font-mono text-xs uppercase tracking-widest text-violet-400">
        Design Intelligence
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-sm text-sm ${m.role === 'user' ? 'bg-violet-900/20 border border-violet-500/30 ml-4' : 'bg-white/5 border border-white/10 mr-4'}`}>
            <span className="block text-[10px] uppercase opacity-50 mb-1">{m.role}</span>
            {m.content}
          </div>
        ))}
      </div>
      <div className="p-4 bg-obsidian-800 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Modificar diseño..."
            className="w-full bg-black/40 border border-white/20 rounded-md p-2 text-xs focus:border-violet-500 outline-none transition-all placeholder:text-white/20"
          />
        </div>
      </div>
    </div>
  )
}
