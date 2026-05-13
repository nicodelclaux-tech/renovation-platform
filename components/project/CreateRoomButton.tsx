'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function CreateRoomButton({ projectId }: { projectId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [wing, setWing] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name: name.trim(), project_id: projectId, floor: floor || null, wing: wing || null })
      .select()
      .single();
    
    if (!error && data) {
      router.push(`/projects/${projectId}/rooms/${data.id}`);
    }
    setLoading(false);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-xs bg-accent/10 text-accent px-sm py-xs rounded-md text-sm hover:bg-accent/20 transition-all"
      >
        <Plus size={14} /> Add Room
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-secondary border border-border rounded-lg p-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-neutral">Add Room</h2>
            <div className="space-y-md mt-md">
              <div>
                <label className="text-xs font-mono text-text-dim uppercase tracking-widest">Room Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Living Room..."
                  className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="text-xs font-mono text-text-dim uppercase tracking-widest">Floor</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="Ground"
                    className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-text-dim uppercase tracking-widest">Wing</label>
                  <input
                    type="text"
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    placeholder="North"
                    className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-sm mt-md">
              <button onClick={() => setShowModal(false)} className="px-md py-xs text-text-dim text-sm hover:text-neutral">Cancel</button>
              <button onClick={handleCreate} disabled={loading || !name.trim()} className="bg-accent text-neutral px-md py-xs rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
