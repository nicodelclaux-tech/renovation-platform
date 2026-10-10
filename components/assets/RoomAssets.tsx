'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoomAsset, RoomAssetKind } from '@/lib/types/database';
import {
  AlertCircle,
  FileText,
  ImagePlus,
  Loader2,
  Paperclip,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type AssetWithUrl = RoomAsset & { signedUrl: string | null };

type PendingUpload = {
  id: string;
  name: string;
  progress: number;
  error?: string;
};

const MAX_BYTES = 15 * 1024 * 1024;

const KIND_OPTIONS: { value: RoomAssetKind; label: string }[] = [
  { value: 'photo', label: 'Room photo' },
  { value: 'floor_plan', label: 'Floor plan' },
  { value: 'reference', label: 'Reference' },
  { value: 'other', label: 'Other' },
];

const KIND_LABEL: Record<RoomAssetKind, string> = {
  photo: 'Photo',
  floor_plan: 'Plan',
  reference: 'Ref',
  other: 'Other',
};

function validateFile(file: File): string | null {
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return 'Only images or PDFs';
  }
  if (file.size > MAX_BYTES) return 'Larger than 15 MB';
  if (file.size === 0) return 'Empty file';
  return null;
}

function uploadWithProgress(
  form: FormData,
  onProgress: (pct: number) => void
): Promise<AssetWithUrl> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/assets');
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const body = xhr.response as { asset?: AssetWithUrl; error?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.asset) resolve(body.asset);
      else reject(new Error(body?.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });
}

export default function RoomAssets({ roomId }: { roomId: string }) {
  const [assets, setAssets] = useState<AssetWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<RoomAssetKind>('photo');
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assets?roomId=${encodeURIComponent(roomId)}`, {
        cache: 'no-store',
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to load assets');
      setAssets(body.assets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    load();
  }, [load]);

  const updatePending = (id: string, patch: Partial<PendingUpload>) =>
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setError(null);

    for (const file of list) {
      const id = crypto.randomUUID();
      const invalid = validateFile(file);
      setPending((prev) => [...prev, { id, name: file.name, progress: 0, error: invalid ?? undefined }]);
      if (invalid) continue;

      const form = new FormData();
      form.append('roomId', roomId);
      form.append('kind', kind);
      form.append('file', file);

      uploadWithProgress(form, (progress) => updatePending(id, { progress }))
        .then((asset) => {
          setAssets((prev) => [asset, ...prev]);
          setPending((prev) => prev.filter((p) => p.id !== id));
        })
        .catch((e: Error) => updatePending(id, { error: e.message }));
    }
  };

  const handleDelete = async (asset: AssetWithUrl) => {
    if (!window.confirm(`Delete "${asset.file_name || 'this file'}"? This cannot be undone.`)) return;
    setDeletingId(asset.id);
    setError(null);
    try {
      const res = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to delete');
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <Paperclip size={14} className="text-text-dim" />
          <h3 className="text-sm font-semibold text-neutral">Assets</h3>
          {!loading && <span className="text-xs text-text-muted">{assets.length}</span>}
        </div>
        <button
          onClick={load}
          disabled={loading}
          title="Refresh"
          className="text-text-muted hover:text-neutral disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex items-center gap-xs">
        <label htmlFor={`asset-kind-${roomId}`} className="text-xs text-text-dim shrink-0">
          Upload as
        </label>
        <select
          id={`asset-kind-${roomId}`}
          value={kind}
          onChange={(e) => setKind(e.target.value as RoomAssetKind)}
          className="flex-1 min-w-0 border border-border rounded-md px-sm py-1 text-xs text-neutral bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-xs rounded-md border border-dashed px-sm py-md text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-border text-text-dim hover:border-accent hover:text-neutral'
        }`}
      >
        <Upload size={16} />
        <p className="text-xs font-medium">Drop files or click to upload</p>
        <p className="text-[11px] text-text-muted">Images or PDF, up to 15 MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {pending.length > 0 && (
        <ul className="space-y-xs">
          {pending.map((p) => (
            <li key={p.id} className="rounded-md border border-border px-sm py-1.5">
              <div className="flex items-center gap-xs">
                {p.error ? (
                  <AlertCircle size={12} className="text-red-600 shrink-0" />
                ) : (
                  <Loader2 size={12} className="animate-spin text-accent shrink-0" />
                )}
                <span className="flex-1 min-w-0 truncate text-xs text-neutral">{p.name}</span>
                {p.error ? (
                  <button
                    onClick={() => setPending((prev) => prev.filter((x) => x.id !== p.id))}
                    title="Dismiss"
                    className="text-text-muted hover:text-neutral"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <span className="text-[11px] text-text-muted tabular-nums">{p.progress}%</span>
                )}
              </div>
              {p.error ? (
                <p className="mt-0.5 text-[11px] text-red-600">{p.error}</p>
              ) : (
                <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent transition-[width] duration-200"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div className="flex items-start gap-xs rounded-md bg-red-50 px-sm py-1.5 text-xs text-red-700">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} title="Dismiss">
            <X size={12} />
          </button>
        </div>
      )}

      {loading && assets.length === 0 ? (
        <div className="grid grid-cols-2 gap-xs">
          {[0, 1].map((i) => (
            <div key={i} className="aspect-square rounded-md bg-secondary animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex items-center gap-xs text-xs text-text-muted">
          <ImagePlus size={13} />
          No photos, plans or references yet.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-xs">
          {assets.map((asset) => {
            const isPdf = asset.mime_type === 'application/pdf';
            const deleting = deletingId === asset.id;
            return (
              <li
                key={asset.id}
                className={`group relative aspect-square overflow-hidden rounded-md border border-border bg-surface-alt ${
                  deleting ? 'opacity-50' : ''
                }`}
              >
                <a
                  href={asset.signedUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={asset.notes || asset.file_name || undefined}
                  className="block h-full w-full"
                >
                  {isPdf || !asset.signedUrl ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-xs p-xs text-text-dim">
                      <FileText size={24} />
                      <span className="w-full truncate text-center text-[11px]">
                        {asset.file_name || 'File'}
                      </span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- signed URLs are short-lived
                    <img
                      src={asset.signedUrl}
                      alt={asset.file_name || 'Room asset'}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </a>
                <span className="pointer-events-none absolute left-1 top-1 rounded-sm bg-surface/90 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-neutral shadow-card">
                  {KIND_LABEL[asset.kind] ?? asset.kind}
                </span>
                <button
                  onClick={() => handleDelete(asset)}
                  disabled={deleting}
                  title="Delete"
                  className="absolute right-1 top-1 rounded-sm bg-surface/90 p-1 text-text-dim shadow-card opacity-0 transition-opacity hover:text-red-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-100 [@media(hover:none)]:opacity-100"
                >
                  {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
