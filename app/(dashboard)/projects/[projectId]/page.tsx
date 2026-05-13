import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { StyleBibleEditor } from '@/components/project/StyleBibleEditor';
import { RoomsList } from '@/components/project/RoomsList';
import { CreateRoomButton } from '@/components/project/CreateRoomButton';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const supabase = createServerClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .single();

  if (!project) notFound();

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('project_id', params.projectId)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-primary p-lg">
      <div className="max-w-6xl mx-auto">
        <Link href="/projects" className="flex items-center gap-xs text-text-dim text-sm hover:text-neutral mb-md">
          <ChevronLeft size={16} /> Back to Projects
        </Link>

        <div className="flex items-start justify-between mb-lg">
          <div>
            <h1 className="text-3xl font-bold text-neutral">{project.name}</h1>
            <p className="text-text-dim text-sm mt-xs font-mono">Project Overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Rooms */}
          <div className="lg:col-span-2 space-y-md">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral">Rooms</h2>
              <CreateRoomButton projectId={params.projectId} />
            </div>
            <RoomsList rooms={rooms || []} projectId={params.projectId} />
          </div>

          {/* Style Bible */}
          <div>
            <h2 className="text-lg font-semibold text-neutral mb-md">Style Bible</h2>
            <StyleBibleEditor projectId={params.projectId} initialData={project.style_bible as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
