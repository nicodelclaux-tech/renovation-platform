'use client';

import { Generation } from '@/lib/types/database';
import { supabase } from '@/lib/supabase';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function GenerationCard({ generation }: { generation: Generation }) {
  const [status, setStatus] = useState(generation.status);

  const handleApprove = async () => {
    setStatus('approved');
    await supabase.from('generations').update({ status: 'approved' }).eq('id', generation.id);
  };

  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    generating: 'text-blue-400 bg-blue-400/10',
    completed: 'text-green-400 bg-green-400/10',
    failed: 'text-red-400 bg-red-400/10',
    approved: 'text-accent bg-accent/10',
  };

  return (
    <article className="bg-secondary/40 border border-border rounded-lg overflow-hidden group hover:border-accent/30 transition-all">
      {generation.image_url ? (
        <div className="aspect-[4/3] bg-primary relative overflow-hidden">
          <img
            src={generation.image_url}
            alt={generation.prompt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-primary flex items-center justify-center">
          {status === 'generating' ? (
            <Loader2 size={24} className="text-accent animate-spin" />
          ) : status === 'failed' ? (
            <AlertCircle size={24} className="text-red-400" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary border border-border" />
          )}
        </div>
      )}

      <div className="p-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-dim line-clamp-1">{generation.prompt}</p>
          <span className={`text-[10px] font-mono uppercase px-xs py-0.5 rounded ${statusColors[status]}`}>
            {status}
          </span>
        </div>
        {status === 'completed' && (
          <button
            onClick={handleApprove}
            className="mt-sm flex items-center gap-xs text-xs text-accent hover:text-neutral transition-colors"
          >
            <Check size={12} /> Approve direction
          </button>
        )}
      </div>
    </article>
  );
}
