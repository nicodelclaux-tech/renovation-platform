     1|'use client'
     2|
     3|import React from 'react';
     4|import { 
     5|  Plus, 
     6|  Search, 
     7|  LayoutDashboard, 
     8|  Home, 
     9|  Image as ImageIcon, 
    10|  Settings, 
    11|  Box, 
    12|  History,
    13|  ChevronRight
    14|} from 'lucide-react';
    15|import { HouseStyleBible } from '@/components/project/HouseStyleBible';
    16|
    17|export function DashboardLayout({
    18|  children,
    19|}: {
    20|  children: React.ReactNode;
    21|}) {
    22|  return (
    23|    <div className="flex h-screen bg-primary text-neutral overflow-hidden">
    24|      {/* LEFT SIDEBAR: Architecture & Rooms */}
    25|      <aside className="w-64 border-r border-border bg-secondary/30 flex flex-col">
    26|        <div className="p-md flex items-center gap-sm">
    27|          <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center font-bold text-neutral">R</div>
    28|          <span className="font-mono text-label tracking-widest uppercase">RenovAI</span>
    29|        </div>
    30|
    31|        <nav className="flex-1 px-sm py-md space-y-sm overflow-y-auto">
    32|          <div className="text-[10px] font-mono uppercase text-text-dim px-md mb-xs tracking-widest">General</div>
    33|          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active />
    34|          <NavItem icon={<History size={18} />} label="Timeline" />
    35|          
    36|          <div className="text-[10px] font-mono uppercase text-text-dim px-md mb-xs mt-lg tracking-widest">House Structure</div>
    37|          <NavItem icon={<Home size={18} />} label="Main House" />
    38|          <div className="ml-md space-y-xs">
    39|            <NavItem label="Living Room" small activeSub />
    40|            <NavItem label="Master Kitchen" small />
    41|            <NavItem label="Exterior Garden" small />
    42|          </div>
    43|        </nav>
    44|
    45|        <div className="p-md border-t border-border">
    46|          <button className="w-full py-xs px-sm bg-accent hover:bg-accent-muted transition-colors rounded-sm flex items-center justify-center gap-xs text-xs font-medium">
    47|            <Plus size={14} /> NEW PROJECT
    48|          </button>
    49|        </div>
    50|      </aside>
    51|
    52|      {/* MAIN CANVAS */}
    53|      <main className="flex-1 flex flex-col bg-primary relative">
    54|        <header className="h-14 border-b border-border flex items-center justify-between px-lg bg-secondary/10 backdrop-blur-md sticky top-0 z-10">
    55|          <div className="flex items-center gap-xs text-xs text-text-dim">
    56|            <span>Projects</span>
    57|            <ChevronRight size={12} />
    58|            <span className="text-neutral">Victorian Townhouse</span>
    59|            <ChevronRight size={12} />
    60|            <span className="text-accent underline underline-offset-4">Living Room</span>
    61|          </div>
    62|          
    63|          <div className="flex items-center gap-md">
    64|            <div className="relative group">
    65|              <Search size={16} className="absolute left-sm top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent" />
    66|              <input 
    67|                type="text" 
    68|                placeholder="Search assets..." 
    69|                className="bg-secondary/50 border border-border rounded-full py-1 pl-8 pr-4 text-xs focus:outline-none focus:border-accent w-48 transition-all"
    70|              />
    71|            </div>
    72|            <Settings size={18} className="text-text-dim hover:text-neutral cursor-pointer" />
    73|          </div>
    74|        </header>
    75|
    76|        <div className="flex-1 overflow-y-auto p-lg">
    77|          {children}
    78|        </div>
    79|      </main>
    80|
    81|      {/* RIGHT SIDEBAR: Style Bible & AI Controls */}
    82|      <aside className="w-80 border-l border-border bg-secondary/20 flex flex-col p-md space-y-md">
    83|        <HouseStyleBible />
    84|        
    85|        <div className="space-y-sm">
    86|          <div className="text-[10px] font-mono uppercase text-text-dim tracking-widest">Generation Controls</div>
    87|          <div className="bg-secondary/40 border border-border rounded-lg p-sm space-y-md">
    88|             <div className="space-y-xs">
    89|                <label className="text-[10px] font-mono text-text-dim">RENDER STYLE</label>
    90|                <select className="w-full bg-primary border border-border rounded-sm text-xs p-1">
    91|                  <option>Architectural Editorial</option>
    92|                  <option>Construction Sketch</option>
    93|                  <option>Daylight Simulation</option>
    94|                </select>
    95|             </div>
    96|             
    97|             <div className="space-y-sm">
    98|                <GenerateControl label="Warmer Palette" />
    99|                <GenerateControl label="High Density Styling" />
   100|                <GenerateControl label="English Townhouse Vibe" />
   101|             </div>
   102|
   103|             <button className="w-full py-md bg-accent text-neutral font-bold rounded-md hover:brightness-110 shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-sm">
   104|                <Box size={18} /> GENERATE CONCEPTS
   105|             </button>
   106|          </div>
   107|        </div>
   108|      </aside>
   109|    </div>
   110|  );
   111|}
   112|
   113|function NavItem({ icon, label, active, small, activeSub }: { icon?: any, label: string, active?: boolean, small?: boolean, activeSub?: boolean }) {
   114|  return (
   115|    <div className={`
   116|      flex items-center gap-sm px-md py-2 rounded-sm cursor-pointer transition-all
   117|      ${active ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-text-dim hover:text-neutral hover:bg-secondary/40'}
   118|      ${small ? 'py-1 text-xs' : 'text-sm'}
   119|      ${activeSub ? 'text-neutral' : ''}
   120|    `}>
   121|      {icon}
   122|      <span>{label}</span>
   123|    </div>
   124|  );
   125|}
   126|
   127|function GenerateControl({ label }: { label: string }) {
   128|  return (
   129|    <div className="flex items-center justify-between group">
   130|      <span className="text-[11px] text-text-dim group-hover:text-neutral transition-colors cursor-default">{label}</span>
   131|      <div className="w-8 h-4 bg-secondary border border-border rounded-full relative cursor-pointer">
   132|        <div className="w-3 h-3 bg-text-dim absolute top-[1px] left-[1px] rounded-full transition-all group-hover:bg-accent" />
   133|      </div>
   134|    </div>
   135|  );
   136|}
   137|