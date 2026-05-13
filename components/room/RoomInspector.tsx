'use client';

import { useState } from 'react';
import { Room } from '@/lib/types/database';
import { supabase } from '@/lib/supabase';
import { Save, CheckCircle, Building2, Paintbrush, Sliders } from 'lucide-react';

export default function RoomInspector({ room, projectId }: { room: Room; projectId: string }) {
  const [architecture, setArchitecture] = useState(room.fixed_architecture || '');
  const [brief, setBrief] = useState(room.design_brief || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('rooms').update({ fixed_architecture: architecture, design_brief: brief }).eq('id', room.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <aside className="h-full overflow-y-auto border-l border-border bg-surface p-md">
      <div className="flex items-center justify-between mb-lg">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Inspector</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-xs text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50 transition-colors"
        >
          {saved ? <><CheckCircle size={13} /> Saved</> : <><Save size={13} /> {saving ? '...' : 'Save'}</>}
        </button>
      </div>

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
            {['Warmer', 'Cooler', 'More Classic', 'More Modern', 'Softer', 'Bolder'].map((adj) => (
              <button key={adj} className="border border-border rounded-md px-sm py-1.5 text-xs text-text-dim hover:text-neutral hover:bg-secondary hover:border-transparent transition-all">
                {adj}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
