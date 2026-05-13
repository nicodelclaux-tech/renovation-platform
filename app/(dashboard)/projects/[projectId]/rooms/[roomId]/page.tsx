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
  const { data: room } = await supabase.from('rooms').select('*').eq('id', params.roomId).single();
  if (!room) notFound();
  const { data: project } = await supabase.from('projects').select('*').eq('id', params.projectId).single();
  const { data: generations } = await supabase.from('generations').select('*').eq('room_id', params.roomId).order('created_at', { ascending: false });

  return (
    <div className="h-screen flex flex-col bg-primary">
      <div className="h-12 border-b border-border px-md flex items-center bg-surface">
        <Link href={`/projects/${params.projectId}`} className="flex items-center gap-xs text-text-dim text-sm hover:text-neutral transition-colors">
          <ChevronLeft size={16} />
          <span>{project?.name}</span>
          <span className="text-text-muted">/</span>
          <span className="text-neutral font-medium">{room.name}</span>
        </Link>
      </div>
      <div className="flex-1 grid grid-cols-[1fr_320px_300px] overflow-hidden">
        <RoomCanvas roomId={params.roomId} generations={generations || []} projectId={params.projectId} />
        <RoomInspector room={room} projectId={params.projectId} />
        <DesignChat roomId={params.roomId} />
      </div>
    </div>
  );
}
