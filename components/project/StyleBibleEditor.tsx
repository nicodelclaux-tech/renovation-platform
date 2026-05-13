'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { StyleBible } from '@/lib/types/database';
import { Save, Book } from 'lucide-react';

export function StyleBibleEditor({ projectId, initialData }: { projectId: string; initialData?: StyleBible }) {
  const [bible, setBible] = useState<StyleBible>(initialData || {
    project_style: '',
    inspirations: [],
    materials: [],
    mood: [],
    avoid: [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('projects').update({ style_bible: bible }).eq('id', projectId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateArray = (key: keyof StyleBible, value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    setBible({ ...bible, [key]: arr });
  };

  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-md space-y-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Book size={18} className="text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-text-dim">Style Bible</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-xs text-xs bg-accent/10 text-accent px-sm py-xs rounded-md hover:bg-accent/20 disabled:opacity-50"
        >
          <Save size={12} /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div>
        <label className="text-[10px] font-mono text-text-dim uppercase">Core Style</label>
        <input
          type="text"
          value={bible.project_style || ''}
          onChange={(e) => setBible({ ...bible, project_style: e.target.value })}
          placeholder="Timeless London Townhouse"
          className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-text-dim uppercase">Inspirations (comma-separated)</label>
        <input
          type="text"
          value={(bible.inspirations || []).join(', ')}
          onChange={(e) => updateArray('inspirations', e.target.value)}
          placeholder="Finca Cortesin, Soho House"
          className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-text-dim uppercase">Materials (comma-separated)</label>
        <input
          type="text"
          value={(bible.materials || []).join(', ')}
          onChange={(e) => updateArray('materials', e.target.value)}
          placeholder="Oak, Linen, Aged Brass"
          className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-text-dim uppercase">Mood (comma-separated)</label>
        <input
          type="text"
          value={(bible.mood || []).join(', ')}
          onChange={(e) => updateArray('mood', e.target.value)}
          placeholder="Warm, Layered, Luxurious"
          className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-text-dim uppercase">Avoid (comma-separated)</label>
        <input
          type="text"
          value={(bible.avoid || []).join(', ')}
          onChange={(e) => updateArray('avoid', e.target.value)}
          placeholder="Ultra Modern, High Gloss"
          className="mt-xs w-full bg-primary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}
