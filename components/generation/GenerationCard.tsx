export function GenerationCard({
  title,
  status
}: {
  title: string;
  status: "Approved" | "Draft";
}) {
  return (
    <article className="border border-stone-300 bg-white p-3 shadow-sm">
      <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-300" />
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-1 text-xs text-stone-500">Prompt and image metadata stored here.</p>
        </div>
        <span className="border border-stone-300 px-2 py-1 text-xs">{status}</span>
      </div>
    </article>
  );
}
