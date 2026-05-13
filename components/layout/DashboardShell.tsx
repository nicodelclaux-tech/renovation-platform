'use client';

import React from 'react';
import { SidebarNav } from './SidebarNav';
import { Plus } from 'lucide-react';
import Link from 'next/link';

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
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-secondary/30 flex flex-col">
        <div className="p-md flex items-center gap-sm">
          <Link href="/projects" className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center font-bold text-neutral text-sm">R</div>
            <span className="font-mono text-xs tracking-widest uppercase text-neutral">RenovAI</span>
          </Link>
        </div>

        <SidebarNav />

        <div className="p-sm border-t border-border">
          <Link href="/projects">
            <button className="w-full py-xs px-sm bg-accent hover:brightness-110 transition-all rounded-md flex items-center justify-center gap-xs text-xs font-medium text-neutral">
              <Plus size={14} /> New Project
            </button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
