import { createServerClient } from '@/lib/supabase-server';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProjectButton } from '@/components/project/CreateProjectButton';

export default async function ProjectsPage() {
  const supabase = createServerClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <div className="min-h-screen bg-primary p-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h1 className="text-3xl font-bold text-neutral">Projects</h1>
            <p className="text-text-dim text-sm mt-xs">Your renovation projects</p>
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
          <div className="text-center py-xl">
            <p className="text-text-dim text-lg">No projects yet</p>
            <p className="text-text-dim text-sm mt-xs">Create your first renovation project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
