import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import RoomCanvas from '@/components/room/RoomCanvas';
import RoomInspector from '@/components/room/RoomInspector';
import DesignChat from '@/components/layout/DesignChat';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function RoomPage({
  params,
}: {
  params: { projectId: string; roomId: string };
}) {
  const supabase = createServerClient();
  
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', params.roomId)
    .single();

  if (!room) notFound();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .single();

  const { data: generations } = await supabase
    .from('generations')
    .select('*')
    .eq('room_id', params.roomId)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-primary">
      <div className="border-b border-border px-lg py-sm">
        <Link href={`/projects/${params.projectId}`} className="flex items-center gap-xs text-text-dim text-sm hover:text-neutral">
          <ChevronLeft size={16} /> {project?.name || 'Project'} / {room.name}
        </Link>
      </div>
      <div className="grid h-[calc(100vh-49px)] grid-cols-[1fr_360px_320px]">
        <RoomCanvas roomId={params.roomId} generations={generations || []} projectId={params.projectId} />
        <RoomInspector room={room} projectId={params.projectId} />
        <DesignChat roomId={params.roomId} />
      </div>
    </div>
  );
}
