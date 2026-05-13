'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GenerateButton({ roomId, projectId }: { roomId: string; projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, projectId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-xs bg-accent text-neutral px-md py-xs rounded-md font-medium text-sm hover:brightness-110 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
      {loading ? 'Generating...' : 'Generate Concept'}
    </button>
  );
}
