import Link from 'next/link';
import { Project } from '@/lib/types/database';
import { Home, ArrowUpRight } from 'lucide-react';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-surface border border-border rounded-lg p-md hover:shadow-[var(--shadow-card)] transition-all cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/8 transition-colors">
            <Home size={18} className="text-text-dim group-hover:text-accent" />
          </div>
          <ArrowUpRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h3 className="mt-md text-neutral font-semibold">{project.name}</h3>
        <p className="text-text-dim text-xs mt-1">
          {(project.style_bible as any)?.project_style || 'No style defined'}
        </p>
        <p className="text-text-muted text-[11px] mt-sm">
          {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </Link>
  );
}
