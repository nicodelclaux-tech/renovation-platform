import Link from 'next/link';
import { Project } from '@/lib/types/database';
import { Home, Calendar } from 'lucide-react';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-secondary/50 border border-border rounded-lg p-md hover:border-accent/50 transition-all cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Home size={20} className="text-accent" />
          </div>
          <span className="text-[10px] font-mono text-text-dim">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className="mt-md text-neutral font-semibold text-lg">{project.name}</h3>
        <p className="text-text-dim text-xs mt-xs font-mono uppercase tracking-wider">
          {(project.style_bible as any)?.project_style || 'No style defined'}
        </p>
      </div>
    </Link>
  );
}
