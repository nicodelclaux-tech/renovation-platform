import { createServerClient } from '@/lib/supabase-server';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProjectButton } from '@/components/project/CreateProjectButton';
import { FolderOpen } from 'lucide-react';

export default async function ProjectsPage() {
  const supabase = createServerClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <div className="min-h-screen bg-primary p-xl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h1 className="text-2xl font-semibold text-neutral tracking-tight">Projects</h1>
            <p className="text-text-dim text-sm mt-1">Manage your renovation projects</p>
          </div>
          <CreateProjectButton />
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-xl border border-dashed border-border rounded-lg">
            <FolderOpen size={40} className="text-text-muted mx-auto mb-md" />
            <p className="text-text-dim text-lg font-medium">No projects yet</p>
            <p className="text-text-muted text-sm mt-1">Create your first renovation project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
