'use client';

import React, { useEffect, useState } from 'react';
import { SidebarNav } from './SidebarNav';
import { Plus, PanelLeftClose, PanelLeft, Menu, X, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
  projectId?: string;
  roomId?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed', err);
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  // On mobile the drawer is always expanded; the collapsed rail is desktop-only.
  const showLabels = !collapsed || mobileOpen;

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-border bg-surface flex flex-col transition-all duration-200 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-16' : 'md:w-60'}`}
      >
        {/* Header */}
        <div className="h-14 px-md flex items-center justify-between border-b border-border">
          {showLabels && (
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
            className="hidden md:block text-text-dim hover:text-neutral p-1 rounded-md hover:bg-secondary transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-text-dim hover:text-neutral p-1 rounded-md hover:bg-secondary transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        {showLabels ? <SidebarNav /> : <div className="flex-1" />}

        {/* Footer */}
        <div className="p-sm border-t border-border space-y-xs">
          {showLabels && (
            <Link href="/projects">
              <button className="w-full py-2 px-sm bg-accent hover:bg-accent-hover transition-colors rounded-md flex items-center justify-center gap-xs text-xs font-medium text-white shadow-sm">
                <Plus size={14} /> New Project
              </button>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            aria-label="Sign out"
            className={`w-full py-2 px-sm rounded-md flex items-center gap-xs text-xs font-medium text-text-dim hover:text-neutral hover:bg-secondary transition-colors disabled:opacity-50 ${
              showLabels ? 'justify-start' : 'justify-center'
            }`}
          >
            <LogOut size={14} />
            {showLabels && <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden h-12 px-md flex items-center gap-sm border-b border-border bg-surface">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-dim hover:text-neutral p-1 rounded-md hover:bg-secondary transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Link href="/projects" className="flex items-center gap-sm">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center font-bold text-white text-[10px]">
              R
            </div>
            <span className="font-semibold text-sm text-neutral tracking-tight">RenovAI</span>
          </Link>
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto bg-secondary">
          {children}
        </main>
      </div>
    </div>
  );
}
