'use client'

import React from 'react';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  Home, 
  Image as ImageIcon, 
  Settings, 
  Box, 
  History,
  ChevronRight
} from 'lucide-react';
import { HouseStyleBible } from '@/components/project/HouseStyleBible';

export default function DashboardShell({
  children,
  projectId,
  roomId,
}: {
  children: React.ReactNode;
  projectId?: string;
  roomId?: string;
}) {
  return (
    <div className="flex h-screen bg-primary text-neutral overflow-hidden">
      {/* LEFT SIDEBAR: Architecture & Rooms */}
      <aside className="w-64 border-r border-border bg-secondary/30 flex flex-col">
        <div className="p-md flex items-center gap-sm">
          <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center font-bold text-neutral">R</div>
          <span className="font-mono text-label tracking-widest uppercase">RenovAI</span>
        </div>

        <nav className="flex-1 px-sm py-md space-y-sm overflow-y-auto">
          <div className="text-[10px] font-mono uppercase text-text-dim px-md mb-xs tracking-widest">General</div>
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active />
          <NavItem icon={<History size={18} />} label="Timeline" />
          
          <div className="text-[10px] font-mono uppercase text-text-dim px-md mb-xs mt-lg tracking-widest">House Structure</div>
          <NavItem icon={<Home size={18} />} label="Main House" />
          <div className="ml-md space-y-xs">
            <NavItem label="Living Room" small activeSub />
            <NavItem label="Master Kitchen" small />
            <NavItem label="Exterior Garden" small />
          </div>
        </nav>

        <div className="p-md border-t border-border">
          <button className="w-full py-xs px-sm bg-accent hover:bg-accent-muted transition-colors rounded-sm flex items-center justify-center gap-xs text-xs font-medium">
            <Plus size={14} /> NEW PROJECT
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 flex flex-col bg-primary relative">
        <header className="h-14 border-b border-border flex items-center justify-between px-lg bg-secondary/10 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-xs text-xs text-text-dim">
            <span>Projects</span>
            <ChevronRight size={12} />
            <span className="text-neutral">Victorian Townhouse</span>
            <ChevronRight size={12} />
            <span className="text-accent underline underline-offset-4">Living Room</span>
          </div>
          
          <div className="flex items-center gap-md">
            <div className="relative group">
              <Search size={16} className="absolute left-sm top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="bg-secondary/50 border border-border rounded-full py-1 pl-8 pr-4 text-xs focus:outline-none focus:border-accent w-48 transition-all"
              />
            </div>
            <Settings size={18} className="text-text-dim hover:text-neutral cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-lg">
          {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR: Style Bible & AI Controls */}
      <aside className="w-80 border-l border-border bg-secondary/20 flex flex-col p-md space-y-md">
        <HouseStyleBible />
        
        <div className="space-y-sm">
          <div className="text-[10px] font-mono uppercase text-text-dim tracking-widest">Generation Controls</div>
          <div className="bg-secondary/40 border border-border rounded-lg p-sm space-y-md">
             <div className="space-y-xs">
                <label className="text-[10px] font-mono text-text-dim">RENDER STYLE</label>
                <select className="w-full bg-primary border border-border rounded-sm text-xs p-1">
                  <option>Architectural Editorial</option>
                  <option>Construction Sketch</option>
                  <option>Daylight Simulation</option>
                </select>
             </div>
             
             <div className="space-y-sm">
                <GenerateControl label="Warmer Palette" />
                <GenerateControl label="High Density Styling" />
                <GenerateControl label="English Townhouse Vibe" />
             </div>

             <button className="w-full py-md bg-accent text-neutral font-bold rounded-md hover:brightness-110 shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-sm">
                <Box size={18} /> GENERATE CONCEPTS
             </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavItem({ icon, label, active, small, activeSub }: { icon?: any, label: string, active?: boolean, small?: boolean, activeSub?: boolean }) {
  return (
    <div className={`
      flex items-center gap-sm px-md py-2 rounded-sm cursor-pointer transition-all
      ${active ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-text-dim hover:text-neutral hover:bg-secondary/40'}
      ${small ? 'py-1 text-xs' : 'text-sm'}
      ${activeSub ? 'text-neutral' : ''}
    `}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function GenerateControl({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between group">
      <span className="text-[11px] text-text-dim group-hover:text-neutral transition-colors cursor-default">{label}</span>
      <div className="w-8 h-4 bg-secondary border border-border rounded-full relative cursor-pointer">
        <div className="w-3 h-3 bg-text-dim absolute top-[1px] left-[1px] rounded-full transition-all group-hover:bg-accent" />
      </div>
    </div>
  );
}
