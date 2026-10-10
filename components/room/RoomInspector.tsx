'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Room } from '@/lib/types/database';
import { Save, CheckCircle, Building2, Paintbrush, Sliders, Loader2 } from 'lucide-react';
import { updateRoom } from '@/app/(dashboard)/projects/[projectId]/rooms/[roomId]/actions';

const ADJUSTMENTS: { label: string; instruction: string }[] = [
  { label: 'Warmer', instruction: 'Make the scheme warmer' },
  { label: 'Cooler', instruction: 'Make the scheme cooler' },
  { label: 'More Classic', instruction: 'Make the design more classic' },
  { label: 'More Modern', instruction: 'Make the design more modern' },
  { label: 'Softer', instruction: 'Make the scheme softer and more muted' },
  { label: 'Bolder', instruction: 'Make the scheme bolder with more contrast' },
];

export default function RoomInspector({ room, projectId }: { room: Room; projectId: string }) {
  const [architecture, setArchitecture] = useState(room.fixed_architecture || '');
  const [brief, setBrief] = useState(room.design_brief || '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();

  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [, startRefresh] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    if (isSaving) return;
    setSaveError(null);
    startSave(async () => {
      const result = await updateRoom(room.id, projectId, {
        fixed_architecture: architecture,
        design_brief: brief,
      });
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  };

  // Cmd/Ctrl+S saves the inspector. Keep the latest handler in a ref so the listener is bound once.
  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleAdjust = async (label: string, instruction: string) => {
    if (adjusting) return;
    setAdjusting(label);
    setAdjustError(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, projectId, instruction }),
      });
      const body = (await res.json().catch(() => null)) as { generation?: unknown; error?: string } | null;
      if (!res.ok || !body || body.error || !body.generation) {
        setAdjustError(body?.error || `Generation failed (${res.status})`);
        return;
      }
      startRefresh(() => router.refresh());
    } catch (err) {
      setAdjustError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setAdjusting(null);
    }
  };

  return (
    <aside className="h-full overflow-y-auto border-l border-border bg-surface p-md">
      <div className="flex items-center justify-between mb-lg">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Inspector</p>
        <button
          onClick={handleSave}
          disabled={isSaving}
          title="Save (Ctrl/Cmd+S)"
          className="flex items-center gap-xs text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50 transition-colors"
        >
          {saved ? <><CheckCircle size={13} /> Saved</> : <><Save size={13} /> {isSaving ? 'Saving...' : 'Save'}</>}
        </button>
      </div>

      {saveError && <p role="alert" className="text-red-600 text-xs -mt-md mb-md">{saveError}</p>}

      <div className="space-y-lg">
        <div>
          <div className="flex items-center gap-xs mb-sm">
            <Building2 size={14} className="text-text-dim" />
            <h3 className="text-sm font-semibold text-neutral">Fixed Architecture</h3>
          </div>
          <p className="text-text-muted text-xs mb-sm">Immutable structural facts.</p>
          <textarea
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value)}
            className="w-full h-28 border border-border rounded-md p-sm text-sm text-neutral resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface placeholder:text-text-muted"
            placeholder="Ceiling Height: 2.8m&#10;Windows: 2x North-facing sash&#10;Fireplace: Victorian marble"
          />
        </div>

        <div>
          <div className="flex items-center gap-xs mb-sm">
            <Paintbrush size={14} className="text-text-dim" />
            <h3 className="text-sm font-semibold text-neutral">Design Brief</h3>
          </div>
          <p className="text-text-muted text-xs mb-sm">Mood, materials, and atmosphere.</p>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="w-full h-28 border border-border rounded-md p-sm text-sm text-neutral resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface placeholder:text-text-muted"
            placeholder="Warm minimalism, oak floors, linen curtains..."
          />
        </div>

        <div>
          <div className="flex items-center gap-xs mb-sm">
            <Sliders size={14} className="text-text-dim" />
            <h3 className="text-sm font-semibold text-neutral">Quick Adjustments</h3>
          </div>
          <div className="grid grid-cols-2 gap-xs">
            {ADJUSTMENTS.map(({ label, instruction }) => {
              const isActive = adjusting === label;
              return (
                <button
                  key={label}
                  onClick={() => handleAdjust(label, instruction)}
                  disabled={adjusting !== null}
                  aria-busy={isActive}
                  title={instruction}
                  className={`flex items-center justify-center gap-xs border rounded-md px-sm py-1.5 text-xs transition-all disabled:cursor-not-allowed ${
                    isActive
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-border text-text-dim hover:text-neutral hover:bg-secondary hover:border-transparent disabled:opacity-50'
                  }`}
                >
                  {isActive && <Loader2 size={12} className="animate-spin" />}
                  {label}
                </button>
              );
            })}
          </div>
          {adjusting && <p className="text-text-muted text-xs mt-sm">Generating variation...</p>}
          {adjustError && <p role="alert" className="text-red-600 text-xs mt-sm">{adjustError}</p>}
        </div>
      </div>
    </aside>
  );
}
