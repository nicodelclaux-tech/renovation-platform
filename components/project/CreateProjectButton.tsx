'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function CreateProjectButton() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: name.trim(), user_id: (await supabase.auth.getUser()).data.user?.id || '' })
      .select()
      .single();
    if (!error && data) router.push(`/projects/${data.id}`);
    setLoading(false);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-xs bg-accent text-white px-md py-2 rounded-md font-medium text-sm hover:bg-accent-hover transition-colors"
      >
        <Plus size={16} /> New Project
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-lg w-full max-w-md shadow-[var(--shadow-deep)]">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-lg font-semibold text-neutral">New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-neutral p-1 rounded-md hover:bg-secondary transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-text-dim text-sm mb-md">Give your renovation project a name</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Victorian Townhouse..."
              className="w-full border border-border rounded-md px-sm py-2 text-neutral text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface placeholder:text-text-muted"
              autoFocus
            />
            <div className="flex justify-end gap-sm mt-lg">
              <button onClick={() => setShowModal(false)} className="px-md py-2 text-text-dim text-sm hover:text-neutral rounded-md hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={loading || !name.trim()} className="bg-accent text-white px-md py-2 rounded-md text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors">
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
