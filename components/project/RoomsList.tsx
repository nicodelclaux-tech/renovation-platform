import Link from 'next/link';
import { Room } from '@/lib/types/database';
import { DoorOpen } from 'lucide-react';

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
        <Link key={room.id} href={`/projects/${projectId}/rooms/${room.id}`}>
          <div className="bg-secondary/40 border border-border rounded-lg p-md hover:border-accent/50 transition-all group">
            <div className="flex items-center gap-sm">
              <DoorOpen size={18} className="text-accent" />
              <div>
                <h3 className="text-neutral font-medium">{room.name}</h3>
                <p className="text-text-dim text-xs">
                  {[room.floor, room.wing].filter(Boolean).join(' • ') || 'No location set'}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
