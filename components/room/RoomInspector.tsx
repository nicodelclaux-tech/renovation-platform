'use client';

import { useState } from 'react';
import { Room } from '@/lib/types/database';
import { supabase } from '@/lib/supabase';
import { Save } from 'lucide-react';

export default function RoomInspector({ room, projectId }: { room: Room; projectId: string }) {
  const [architecture, setArchitecture] = useState(room.fixed_architecture || '');
  const [brief, setBrief] = useState(room.design_brief || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('rooms')
      .update({ fixed_architecture: architecture, design_brief: brief })
      .eq('id', room.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <aside className="h-full overflow-y-auto border-l border-border bg-secondary/20 p-md">
      <div className="flex items-center justify-between mb-md">
        <p className="text-[10px] font-mono uppercase tracking-widest text-text-dim">Room Inspector</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-xs text-xs bg-accent/10 text-accent px-sm py-xs rounded-md hover:bg-accent/20 disabled:opacity-50"
        >
          <Save size={12} /> {saved ? 'Saved!' : saving ? '...' : 'Save'}
        </button>
      </div>

      <div className="space-y-lg">
        <div>
          <h3 className="text-sm font-semibold text-neutral mb-xs">Fixed Architecture</h3>
          <p className="text-text-dim text-xs mb-sm">Immutable structural facts: windows, doors, ceiling height, load-bearing walls.</p>
          <textarea
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value)}
            className="w-full h-32 bg-primary border border-border rounded-md p-sm text-sm text-neutral resize-none focus:outline-none focus:border-accent"
            placeholder="Ceiling Height: 2.8m&#10;Windows: 2x North-facing sash&#10;Fireplace: Original Victorian marble"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral mb-xs">Design Brief</h3>
          <p className="text-text-dim text-xs mb-sm">Desired mood, materials, atmosphere, and references for this room.</p>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="w-full h-32 bg-primary border border-border rounded-md p-sm text-sm text-neutral resize-none focus:outline-none focus:border-accent"
            placeholder="Warm minimalism, oak floors, linen curtains, brass fixtures. Reference: Finca Cortesin lobby."
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral mb-xs">Quick Adjustments</h3>
          <div className="grid grid-cols-2 gap-xs">
            {['Warmer', 'Cooler', 'More Classic', 'More Modern', 'Softer', 'Bolder'].map((adj) => (
              <button
                key={adj}
                className="bg-primary border border-border rounded-md px-sm py-xs text-xs text-text-dim hover:text-neutral hover:border-accent/50 transition-all"
              >
                {adj}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
