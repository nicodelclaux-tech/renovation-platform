'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Room } from '@/lib/types/database';
import { DoorOpen, Trash2 } from 'lucide-react';
import { deleteRoom } from '@/app/(dashboard)/projects/[projectId]/actions';

export function RoomsList({ rooms, projectId }: { rooms: Room[]; projectId: string }) {
  if (rooms.length === 0) {
    return (
      <div className="bg-secondary/30 border border-dashed border-border rounded-lg p-lg text-center">
        <p className="text-text-dim">No rooms yet. Add your first room to start designing.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
      {rooms.map((room) => (
        <RoomItem key={room.id} room={room} projectId={projectId} />
      ))}
    </div>
  );
}

function RoomItem({ room, projectId }: { room: Room; projectId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (isPending) return;
    if (!window.confirm(`Delete "${room.name}" and its generations? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteRoom(room.id, projectId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className={`relative group ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <Link href={`/projects/${projectId}/rooms/${room.id}`} className="block">
        <div className="bg-secondary/40 border border-border rounded-lg p-md pr-10 hover:border-accent/50 transition-all">
          <div className="flex items-center gap-sm">
            <DoorOpen size={18} className="text-accent shrink-0" />
            <div className="min-w-0">
              <h3 className="text-neutral font-medium truncate">{room.name}</h3>
              <p className="text-text-dim text-xs">
                {[room.floor, room.wing].filter(Boolean).join(' • ') || 'No location set'}
              </p>
            </div>
          </div>
          {error && <p role="alert" className="text-red-600 text-xs mt-xs">{error}</p>}
        </div>
      </Link>
      <button
        onClick={handleDelete}
        aria-label={`Delete ${room.name}`}
        title="Delete room"
        className="absolute top-sm right-sm p-1 rounded-md text-text-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
