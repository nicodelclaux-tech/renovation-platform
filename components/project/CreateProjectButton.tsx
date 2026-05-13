'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
    
    if (!error && data) {
      router.push(`/projects/${data.id}`);
    }
    setLoading(false);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-xs bg-accent text-neutral px-md py-xs rounded-md font-medium text-sm hover:brightness-110 transition-all"
      >
        <Plus size={16} /> New Project
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-secondary border border-border rounded-lg p-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-neutral">New Project</h2>
            <p className="text-text-dim text-sm mt-xs">Give your renovation project a name</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Victorian Townhouse..."
              className="mt-md w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
              autoFocus
            />
            <div className="flex justify-end gap-sm mt-md">
              <button onClick={() => setShowModal(false)} className="px-md py-xs text-text-dim text-sm hover:text-neutral">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="bg-accent text-neutral px-md py-xs rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
