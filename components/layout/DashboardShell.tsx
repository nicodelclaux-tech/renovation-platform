'use client';

import React from 'react';
import { SidebarNav } from './SidebarNav';
import { Plus, PanelLeftClose, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardShell({
  children,
  projectId,
  roomId,
}: {
  children: React.ReactNode;
  projectId?: string;
  roomId?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-60'
        } border-r border-border bg-surface flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div className="h-14 px-md flex items-center justify-between border-b border-border">
          {!collapsed && (
            <Link href="/projects" className="flex items-center gap-sm">
              <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center font-bold text-white text-xs">
                R
              </div>
              <span className="font-semibold text-sm text-neutral tracking-tight">
                RenovAI
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-dim hover:text-neutral p-1 rounded-md hover:bg-secondary transition-colors"
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation */}
        {!collapsed && <SidebarNav />}

        {/* New Project Button */}
        {!collapsed && (
          <div className="p-sm border-t border-border">
            <Link href="/projects">
              <button className="w-full py-2 px-sm bg-accent hover:bg-accent-hover transition-colors rounded-md flex items-center justify-center gap-xs text-xs font-medium text-white shadow-sm">
                <Plus size={14} /> New Project
              </button>
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-secondary">
        {children}
      </main>
    </div>
  );
}
