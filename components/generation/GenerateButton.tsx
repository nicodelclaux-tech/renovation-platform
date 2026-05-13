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
      if (res.ok) router.refresh();
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
      className="flex items-center gap-xs bg-accent text-white px-md py-1.5 rounded-md font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {loading ? 'Generating...' : 'Generate'}
    </button>
  );
}
