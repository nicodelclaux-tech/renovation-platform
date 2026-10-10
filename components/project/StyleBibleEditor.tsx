'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StyleBible } from '@/lib/types/database';
import { Save, Book, CheckCircle } from 'lucide-react';
import { updateStyleBible } from '@/app/(dashboard)/projects/[projectId]/actions';

type ListKey = 'inspirations' | 'materials' | 'mood' | 'avoid';

const LIST_FIELDS: { key: ListKey; label: string; placeholder: string }[] = [
  { key: 'inspirations', label: 'Inspirations', placeholder: 'Finca Cortesin, Soho House' },
  { key: 'materials', label: 'Materials', placeholder: 'Oak, Linen, Aged Brass' },
  { key: 'mood', label: 'Mood', placeholder: 'Warm, Layered, Luxurious' },
  { key: 'avoid', label: 'Avoid', placeholder: 'Ultra Modern, High Gloss' },
];

const inputClass =
  'mt-xs w-full border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface placeholder:text-text-muted';

const toList = (value: string) => value.split(',').map((s) => s.trim()).filter(Boolean);

export function StyleBibleEditor({ projectId, initialData }: { projectId: string; initialData?: StyleBible }) {
  const [projectStyle, setProjectStyle] = useState(initialData?.project_style ?? '');
  // Keep list fields as raw strings while editing so commas/spaces can be typed freely.
  const [lists, setLists] = useState<Record<ListKey, string>>(() => ({
    inspirations: (initialData?.inspirations ?? []).join(', '),
    materials: (initialData?.materials ?? []).join(', '),
    mood: (initialData?.mood ?? []).join(', '),
    avoid: (initialData?.avoid ?? []).join(', '),
  }));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    if (isPending) return;
    setError(null);
    const bible: StyleBible = {
      project_style: projectStyle.trim(),
      inspirations: toList(lists.inspirations),
      materials: toList(lists.materials),
      mood: toList(lists.mood),
      avoid: toList(lists.avoid),
    };
    startTransition(async () => {
      const result = await updateStyleBible(projectId, bible);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="bg-secondary/50 border border-border rounded-lg p-md space-y-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Book size={18} className="text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-text-dim">Style Bible</span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-xs text-xs bg-accent/10 text-accent px-sm py-xs rounded-md hover:bg-accent/20 disabled:opacity-50"
        >
          {saved ? <CheckCircle size={12} /> : <Save size={12} />} {saved ? 'Saved' : isPending ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && <p role="alert" className="text-red-600 text-xs">{error}</p>}

      <div>
        <label className="text-[10px] font-mono text-text-dim uppercase">Core Style</label>
        <input
          type="text"
          value={projectStyle}
          onChange={(e) => setProjectStyle(e.target.value)}
          placeholder="Timeless London Townhouse"
          className={inputClass}
        />
      </div>

      {LIST_FIELDS.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="text-[10px] font-mono text-text-dim uppercase">{label} (comma-separated)</label>
          <input
            type="text"
            value={lists[key]}
            onChange={(e) => setLists((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className={inputClass}
          />
        </div>
      ))}
    </form>
  );
}
