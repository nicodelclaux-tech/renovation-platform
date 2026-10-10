'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/app/(dashboard)/projects/[projectId]/actions';

const inputClass =
  'mt-xs w-full border border-border rounded-md px-sm py-2 text-neutral text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface placeholder:text-text-muted';

export function CreateRoomButton({ projectId }: { projectId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [wing, setWing] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const close = () => {
    if (isPending) return;
    setShowModal(false);
    setError(null);
  };

  const handleCreate = () => {
    if (!name.trim() || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await createRoom(projectId, { name, floor, wing });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShowModal(false);
      setName('');
      setFloor('');
      setWing('');
      if (result.data) router.push(`/projects/${projectId}/rooms/${result.data.id}`);
      else router.refresh();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') close();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-lg w-full max-w-md shadow-[var(--shadow-deep)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral">Add Room</h2>
              <button onClick={close} className="text-text-muted hover:text-neutral p-1 rounded-md hover:bg-secondary transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-md mt-md">
              <div>
                <label className="text-xs font-medium text-text-dim">Room Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Living Room..."
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="text-xs font-medium text-text-dim">Floor</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ground"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-dim">Wing</label>
                  <input
                    type="text"
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="North"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
            {error && <p role="alert" className="text-red-600 text-xs mt-sm">{error}</p>}
            <div className="flex justify-end gap-sm mt-lg">
              <button onClick={close} className="px-md py-2 text-text-dim text-sm hover:text-neutral rounded-md hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={isPending || !name.trim()} className="bg-accent text-white px-md py-2 rounded-md text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors">
                {isPending ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
