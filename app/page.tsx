import DashboardShell from '@/components/layout/DashboardShell';
import RoomCanvas from '@/components/room/RoomCanvas';

export default function Home() {
  return (
    <DashboardShell>
      <div className="space-y-lg">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Living Room</h1>
            <p className="text-text-dim text-sm">Ground Floor • North Wing</p>
          </div>
          <div className="flex gap-md text-xs font-mono">
             <div className="text-right">
                <p className="text-text-dim">STATUS</p>
                <p className="text-accent underline underline-offset-4 font-bold">Concept Development</p>
             </div>
             <div className="text-right">
                <p className="text-text-dim">CONSTRAINTS</p>
                <p className="text-neutral">4 Factural Points Locked</p>
             </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="grid grid-cols-12 gap-lg h-[calc(100vh-250px)]">
          <div className="col-span-8 bg-secondary/20 rounded-xl border border-border overflow-hidden relative group">
             {/* Mock visual preview */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale-[0.3] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
             <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
             
             <div className="absolute bottom-md left-md right-md flex justify-between items-end">
                <div className="space-y-xs">
                   <div className="flex gap-xs">
                      <span className="bg-accent text-neutral text-[10px] px-1.5 py-0.5 rounded-sm font-bold">MASTER CONCEPT</span>
                      <span className="bg-secondary/80 text-neutral/60 text-[10px] px-1.5 py-0.5 rounded-sm border border-border">v1.2.4</span>
                   </div>
                   <h3 className="text-neutral font-medium">Warm Minimalism • Morning Light Study</h3>
                </div>
                <button className="bg-neutral text-primary px-4 py-2 rounded-md text-xs font-bold hover:scale-105 transition-transform">
                   Enter Refinement Mode
                </button>
             </div>
          </div>

          {/* Quick Assets / Reference Column */}
          <div className="col-span-4 space-y-md">
             <div className="bg-secondary/40 border border-border rounded-lg p-sm">
                <h4 className="text-[10px] font-mono text-text-dim uppercase mb-sm tracking-widest">Architectural Facts</h4>
                <ul className="space-y-xs text-xs text-neutral/80">
                   <li className="flex justify-between p-xs bg-primary/40 rounded-sm border border-border/50">
                      <span>Ceiling Height</span>
                      <span className="text-accent">2.8m</span>
                   </li>
                   <li className="flex justify-between p-xs bg-primary/40 rounded-sm border border-border/50">
                      <span>Window Loc.</span>
                      <span className="text-accent">North-Facing</span>
                   </li>
                </ul>
             </div>

             <div className="bg-secondary/10 border border-dashed border-border rounded-lg h-48 flex flex-col items-center justify-center gap-sm group cursor-pointer hover:bg-secondary/20 transition-all">
                <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center text-text-dim group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </div>
                <p className="text-[10px] font-mono text-text-dim uppercase tracking-widest">Drop Source Assets</p>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
