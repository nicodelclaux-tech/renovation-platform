import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoomCanvas } from "@/components/room/RoomCanvas";
import { RoomInspector } from "@/components/room/RoomInspector";

export default function RoomPage({
  params
}: {
  params: { projectId: string; roomId: string };
}) {
  return (
    <DashboardShell projectId={params.projectId} roomId={params.roomId}>
      <div className="grid h-full grid-cols-[1fr_360px]">
        <RoomCanvas roomId={params.roomId} />
        <RoomInspector roomId={params.roomId} />
      </div>
    </DashboardShell>
  );
}
