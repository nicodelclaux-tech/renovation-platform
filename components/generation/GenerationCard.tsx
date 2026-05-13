'use client';

import { Generation } from '@/lib/types/database';
import { supabase } from '@/lib/supabase';
import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export function GenerationCard({ generation }: { generation: Generation }) {
  const [status, setStatus] = useState(generation.status);

  const handleApprove = async () => {
    setStatus('approved');
    await supabase.from('generations').update({ status: 'approved' }).eq('id', generation.id);
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Pending' },
    generating: { icon: Loader2, color: 'text-blue-600 bg-blue-50', label: 'Generating' },
    completed: { icon: Check, color: 'text-green-600 bg-green-50', label: 'Completed' },
    failed: { icon: AlertCircle, color: 'text-red-600 bg-red-50', label: 'Failed' },
    approved: { icon: Check, color: 'text-accent bg-accent/8', label: 'Approved' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <article className="bg-surface border border-border rounded-lg overflow-hidden group hover:shadow-[var(--shadow-card)] transition-all">
      {generation.image_url ? (
        <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
          <img src={generation.image_url} alt={generation.prompt} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
          {status === 'generating' ? (
            <Loader2 size={24} className="text-accent animate-spin" />
          ) : status === 'failed' ? (
            <AlertCircle size={24} className="text-red-500" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary border border-border" />
          )}
        </div>
      )}

      <div className="p-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-dim line-clamp-1 flex-1">{generation.prompt}</p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${config.color}`}>
            <StatusIcon size={10} className={status === 'generating' ? 'animate-spin' : ''} />
            {config.label}
          </span>
        </div>
        {status === 'completed' && (
          <button onClick={handleApprove} className="mt-sm flex items-center gap-xs text-xs text-accent font-medium hover:text-accent-hover transition-colors">
            <Check size={12} /> Approve
          </button>
        )}
      </div>
    </article>
  );
}
