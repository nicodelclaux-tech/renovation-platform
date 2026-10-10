'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types/database';
import { Home, ArrowUpRight, Pencil, Trash2, Check, X } from 'lucide-react';
import { deleteProject, renameProject } from '@/app/(dashboard)/projects/actions';

export function ProjectCard({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const startEdit = () => {
    setName(project.name);
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setName(project.name);
    setError(null);
  };

  const handleRename = () => {
    const trimmed = name.trim();
    if (!trimmed || isPending) return;
    if (trimmed === project.name) return cancelEdit();
    setError(null);
    startTransition(async () => {
      const result = await renameProject(project.id, trimmed);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (isPending) return;
    if (!window.confirm(`Delete "${project.name}" and all its rooms? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const subtitle = project.style_bible?.project_style || 'No style defined';
  const created = new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (editing) {
    return (
      <div className="bg-surface border border-accent rounded-lg p-md">
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
          <Home size={18} className="text-text-dim" />
        </div>
        <div className="mt-md flex items-center gap-xs">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') cancelEdit();
            }}
            aria-label="Project name"
            className="flex-1 min-w-0 border border-border rounded-md px-sm py-1 text-neutral text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface"
            autoFocus
            disabled={isPending}
          />
          <button
            onClick={handleRename}
            disabled={isPending || !name.trim()}
            aria-label="Save name"
            className="p-1 rounded-md text-accent hover:bg-accent/10 disabled:opacity-50 transition-colors"
          >
            <Check size={16} />
          </button>
          <button
            onClick={cancelEdit}
            disabled={isPending}
            aria-label="Cancel rename"
            className="p-1 rounded-md text-text-muted hover:text-neutral hover:bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {error && <p role="alert" className="text-red-600 text-xs mt-xs">{error}</p>}
        <p className="text-text-muted text-[11px] mt-sm">{created}</p>
      </div>
    );
  }

  return (
    <div className={`relative group ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <Link href={`/projects/${project.id}`} className="block">
        <div className="bg-surface border border-border rounded-lg p-md hover:shadow-[var(--shadow-card)] transition-all cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/8 transition-colors">
              <Home size={18} className="text-text-dim group-hover:text-accent" />
            </div>
            <ArrowUpRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="mt-md text-neutral font-semibold">{project.name}</h3>
          <p className="text-text-dim text-xs mt-1">{subtitle}</p>
          <p className="text-text-muted text-[11px] mt-sm">{created}</p>
          {error && <p role="alert" className="text-red-600 text-xs mt-xs">{error}</p>}
        </div>
      </Link>
      <div className="absolute top-md right-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={startEdit}
          aria-label={`Rename ${project.name}`}
          title="Rename"
          className="p-1 rounded-md text-text-muted hover:text-neutral hover:bg-secondary transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          aria-label={`Delete ${project.name}`}
          title="Delete"
          className="p-1 rounded-md text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
