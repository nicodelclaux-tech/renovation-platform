import { GenerationCard } from "@/components/generation/GenerationCard";

export function RoomCanvas({ roomId }: { roomId: string }) {
  return (
    <section className="h-screen overflow-y-auto p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Room Studio</p>
          <h1 className="mt-2 text-3xl font-semibold capitalize">{roomId.replace("-", " ")}</h1>
        </div>
        <button className="border border-stone-900 px-4 py-2 text-sm hover:bg-stone-900 hover:text-white">
          Generate new concept
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <GenerationCard title="Approved direction" status="Approved" />
        <GenerationCard title="Warmer palette variation" status="Draft" />
        <GenerationCard title="More traditional variation" status="Draft" />
        <GenerationCard title="Lighting study" status="Draft" />
      </div>
    </section>
  );
}
