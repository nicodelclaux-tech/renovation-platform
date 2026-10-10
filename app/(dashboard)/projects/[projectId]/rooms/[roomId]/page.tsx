import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import RoomCanvas from '@/components/room/RoomCanvas';
import RoomInspector from '@/components/room/RoomInspector';
import DesignChat from '@/components/layout/DesignChat';
import RoomAssets from '@/components/assets/RoomAssets';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function RoomPage({
  params,
}: {
  params: Promise<{ projectId: string; roomId: string }>;
}) {
  const { projectId, roomId } = await params;
  const supabase = await createClient();
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .eq('project_id', projectId)
    .maybeSingle();
  if (!room) notFound();
  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
  if (!project) notFound();
  const { data: generations } = await supabase.from('generations').select('*').eq('room_id', roomId).order('created_at', { ascending: false });

  return (
    <div className="h-full flex flex-col bg-primary">
      <div className="h-12 border-b border-border px-md flex items-center bg-surface">
        <Link href={`/projects/${projectId}`} className="flex items-center gap-xs text-text-dim text-sm hover:text-neutral transition-colors">
          <ChevronLeft size={16} />
          <span>{project.name}</span>
          <span className="text-text-muted">/</span>
          <span className="text-neutral font-medium">{room.name}</span>
        </Link>
      </div>
      <div className="flex-1 grid grid-cols-[1fr_320px_300px] overflow-hidden">
        <RoomCanvas roomId={roomId} generations={generations || []} projectId={projectId} />
        <RoomInspector room={room} projectId={projectId}>
          <RoomAssets roomId={roomId} />
        </RoomInspector>
        <DesignChat roomId={roomId} projectId={projectId} />
      </div>
    </div>
  );
}
