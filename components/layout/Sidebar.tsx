import Link from "next/link";
import { Home, Image, Layers, Settings } from "lucide-react";

const rooms = [
  "exterior",
  "hallway",
  "kitchen",
  "library",
  "master-bedroom",
  "dressing-room",
  "bathroom"
];

export function Sidebar({
  projectId,
  activeRoomId
}: {
  projectId: string;
  activeRoomId: string;
}) {
  return (
    <aside className="flex min-h-screen flex-col bg-[#f3efe6] p-5">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">House</p>
        <h2 className="mt-2 text-xl font-semibold">Renovation AI</h2>
      </div>

      <nav className="space-y-1">
        {rooms.map((room) => (
          <Link
            key={room}
            href={`/projects/${projectId}/rooms/${room}`}
            className={`flex items-center gap-3 px-3 py-2 text-sm ${
              activeRoomId === room ? "bg-white shadow-sm" : "hover:bg-white/60"
            }`}
          >
            <Layers size={16} />
            <span className="capitalize">{room.replace("-", " ")}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-2 text-sm text-stone-600">
        <div className="flex items-center gap-3"><Home size={16} /> Project</div>
        <div className="flex items-center gap-3"><Image size={16} /> Assets</div>
        <div className="flex items-center gap-3"><Settings size={16} /> Settings</div>
      </div>
    </aside>
  );
}
