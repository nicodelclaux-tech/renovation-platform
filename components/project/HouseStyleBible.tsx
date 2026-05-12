'use client'

import React from 'react';
import { Book, ShieldCheck, Palette, Layers, AlertTriangle } from 'lucide-react';

interface StyleBibleProps {
  data?: {
    project_style: string;
    inspirations: string[];
    materials: string[];
    mood: string[];
    avoid: string[];
  };
}

export const HouseStyleBible = ({ data }: StyleBibleProps) => {
  const bible = data || {
    project_style: "Timeless London Townhouse",
    inspirations: ["Finca Cortesin", "Casa Tua", "Soho House"],
    materials: ["Oak", "Linen", "Aged Brass", "Natural Stone"],
    mood: ["Warm", "Layered", "Understated", "Luxurious"],
    avoid: ["Ultra Modern", "Cold Minimalism", "High Gloss", "Overstyling"]
  };

  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-md backdrop-blur-md">
      <div className="flex items-center gap-sm mb-md pb-xs border-b border-border">
        <Book size={18} className="text-accent" />
        <h2 className="font-mono text-label uppercase tracking-widest text-neutral">House Style Bible</h2>
      </div>

      <div className="space-y-lg">
        {/* Project Style */}
        <div>
          <p className="text-text-dim text-xs font-mono uppercase mb-xs tracking-tighter">Core Identity</p>
          <p className="text-neutral font-medium text-lg leading-tight">{bible.project_style}</p>
        </div>

        {/* Materials & Mood */}
        <div className="grid grid-cols-2 gap-md">
          <section>
            <div className="flex items-center gap-xs mb-sm text-text-dim">
              <Palette size={14} />
              <span className="text-xs font-mono uppercase">Materials</span>
            </div>
            <div className="flex flex-wrap gap-xs">
              {bible.materials.map(m => (
                <span key={m} className="px-xs py-[2px] bg-primary border border-border rounded-sm text-xs text-neutral/80">{m}</span>
              ))}
            </div>
          </section>
          
          <section>
            <div className="flex items-center gap-xs mb-sm text-text-dim">
              <Layers size={14} />
              <span className="text-xs font-mono uppercase">Mood</span>
            </div>
            <div className="flex flex-wrap gap-xs">
              {bible.mood.map(m => (
                <span key={m} className="px-xs py-[2px] bg-accent/10 border border-accent/20 rounded-sm text-xs text-accent">{m}</span>
              ))}
            </div>
          </section>
        </div>

        {/* Negative Constraints */}
        <div className="bg-primary/40 border border-red-900/20 p-sm rounded-md">
          <div className="flex items-center gap-xs mb-xs text-red-500/70">
            <AlertTriangle size={14} />
            <span className="text-xs font-mono uppercase tracking-tighter">Negative Constraints</span>
          </div>
          <p className="text-text-dim text-xs">
            {bible.avoid.join(' • ')}
          </p>
        </div>
      </div>
      
      <div className="mt-lg pt-sm border-t border-border/50 flex justify-between items-center text-[10px] text-text-dim font-mono">
        <span className="flex items-center gap-xs"><ShieldCheck size={10} /> Persistent Design Memory Active</span>
        <button className="text-accent hover:underline cursor-pointer">Edit Bible</button>
      </div>
    </div>
  );
};
