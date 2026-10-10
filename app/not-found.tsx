import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-md">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-lg shadow-[var(--shadow-card)] text-center">
        <SearchX size={36} className="text-text-muted mx-auto" />
        <h1 className="mt-md text-xl font-semibold text-neutral">Page not found</h1>
        <p className="text-text-dim text-sm mt-1">
          This page doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/projects"
          className="mt-lg inline-flex items-center justify-center gap-xs bg-accent text-white text-sm font-medium px-md py-2 rounded-md hover:bg-accent-hover transition-colors"
        >
          Back to Projects
        </Link>
      </div>
    </div>
  );
}
