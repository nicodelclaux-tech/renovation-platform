export function RoomInspector({ roomId }: { roomId: string }) {
  return (
    <aside className="h-screen overflow-y-auto border-l border-stone-300 bg-white p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Inspector</p>
      <h2 className="mt-2 text-xl font-semibold capitalize">{roomId.replace("-", " ")}</h2>

      <section className="mt-8 space-y-6">
        <div>
          <h3 className="text-sm font-semibold">Fixed architecture</h3>
          <textarea
            className="mt-2 h-28 w-full border border-stone-300 p-3 text-sm"
            placeholder="Window positions, fireplace, ceiling height, doors..."
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold">Room design brief</h3>
          <textarea
            className="mt-2 h-28 w-full border border-stone-300 p-3 text-sm"
            placeholder="Mood, materials, references, desired atmosphere..."
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold">Iteration controls</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {["Warmer", "Cooler", "More classic", "More modern", "Softer", "Cleaner"].map((x) => (
              <button key={x} className="border border-stone-300 px-3 py-2 hover:bg-stone-100">
                {x}
              </button>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
