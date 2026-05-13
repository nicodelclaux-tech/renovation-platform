'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, Room } from '@/lib/types/database';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  Plus,
  ChevronDown,
  ChevronRight,
  DoorOpen,
} from 'lucide-react';

export function SidebarNav() {
  const [projects, setProjects] = useState<(Project & { rooms?: Room[] })[]>(
    []
  );
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectsData) {
        const withRooms = await Promise.all(
          projectsData.map(async (p) => {
            const { data: rooms } = await supabase
              .from('rooms')
              .select('*')
              .eq('project_id', p.id)
              .order('created_at', { ascending: true });
            return { ...p, rooms: rooms || [] };
          })
        );
        setProjects(withRooms);

        // Auto-expand current project
        const currentProjectId = pathname.match(/\/projects\/([^/]+)/)?.[1];
        if (currentProjectId) setExpandedProject(currentProjectId);
      }
    };
    load();
  }, [pathname]);

  return (
    <nav className="flex-1 px-sm py-md space-y-xs overflow-y-auto">
      {/* All Projects link */}
      <Link href="/projects">
        <div
          className={`flex items-center gap-sm px-md py-2 rounded-md cursor-pointer transition-all text-sm ${
            pathname === '/projects'
              ? 'bg-accent/8 text-accent font-medium'
              : 'text-text-dim hover:text-neutral hover:bg-secondary'
          }`}
        >
          <LayoutDashboard size={16} />
          <span>All Projects</span>
        </div>
      </Link>

      {/* Section label */}
      <div className="text-[10px] font-medium uppercase text-text-muted px-md mt-lg mb-xs tracking-wider">
        Projects
      </div>

      {/* Project list */}
      {projects.map((project) => (
        <div key={project.id}>
          {/* Project row */}
          <div
            onClick={() =>
              setExpandedProject(
                expandedProject === project.id ? null : project.id
              )
            }
            className={`flex items-center gap-sm px-md py-2 rounded-md cursor-pointer transition-all text-sm ${
              pathname.includes(project.id)
                ? 'text-neutral font-medium'
                : 'text-text-dim hover:text-neutral hover:bg-secondary'
            }`}
          >
            {expandedProject === project.id ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            <Home size={14} />
            <span className="truncate">{project.name}</span>
          </div>

          {/* Expanded rooms */}
          {expandedProject === project.id && (
            <div className="ml-lg space-y-xs mt-xs">
              {project.rooms?.map((room) => (
                <Link
                  key={room.id}
                  href={`/projects/${project.id}/rooms/${room.id}`}
                >
                  <div
                    className={`flex items-center gap-xs px-sm py-1.5 rounded-md text-xs cursor-pointer transition-all ${
                      pathname.includes(room.id)
                        ? 'text-accent bg-accent/8 font-medium'
                        : 'text-text-dim hover:text-neutral hover:bg-secondary'
                    }`}
                  >
                    <DoorOpen size={12} />
                    <span>{room.name}</span>
                  </div>
                </Link>
              ))}
              <Link href={`/projects/${project.id}`}>
                <div className="flex items-center gap-xs px-sm py-1.5 text-xs text-text-muted hover:text-accent cursor-pointer transition-colors">
                  <Plus size={12} />
                  <span>Add room</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
