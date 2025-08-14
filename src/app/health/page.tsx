"use client";
import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ServerIcon,
  CpuChipIcon,
  BoltIcon,
  CircleStackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

type HealthResponse = {
  status: string;
  timestamp: string;
  uptime: number;
  version?: string;
  nodeVersion?: string;
  environment?: string;
  platform?: string;
  arch?: string;
  pid?: number;
  ppid?: number;
  hostname?: string;
  commitSha?: string | null;
  database?: {
    connected: boolean;
    latencyMs: number | null;
    error: string | null;
  };
  memory?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers?: number | null;
  };
  error?: string;
};

function LoadingSkeleton() {
  const Card = () => (
    <div className="rounded border p-4 bg-white/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
        <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-6 w-44 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div className="h-4 w-64 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card />
        <Card />
        <Card />
      </div>

      <div className="rounded border p-4 bg-white/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      <div className="rounded border bg-white/50">
        <div className="w-full px-4 py-3 border-b">
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="px-4 py-4">
          <div className="h-24 w-full rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/health', { cache: 'no-store' });
      const json = (await res.json()) as HealthResponse;
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to load health info');
      }
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto rounded border p-6 bg-white/50 text-center space-y-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mx-auto" />
          <div className="text-sm text-red-700">{error}</div>
          <div>
            <button
              onClick={fetchHealth}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto rounded border p-6 bg-white/50 text-center space-y-3">
          <div className="text-sm text-gray-700">No health data yet.</div>
          <div>
            <button
              onClick={fetchHealth}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Retry
            </button>
          </div>
        </div>
      </div>
    );

  const secondsToHms = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [
      d ? `${d}d` : null,
      h ? `${h}h` : null,
      m ? `${m}m` : null,
      `${s}s`,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const formatBytes = (bytes?: number | null) => {
    if (bytes == null) return '—';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const statusBadge = (
    <span
      className={
        (data.status === 'healthy'
          ? 'bg-green-100 text-green-800 ring-green-600/20'
          : 'bg-red-100 text-red-800 ring-red-600/20') +
        ' inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
      }
    >
      {data.status === 'healthy' ? (
        <CheckCircleIcon className="h-4 w-4" />
      ) : (
        <ExclamationTriangleIcon className="h-4 w-4" />
      )}
      {data.status}
    </span>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            System Health {statusBadge}
          </h1>
          <p className="text-sm text-gray-500">Updated: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
        <button
          onClick={fetchHealth}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          disabled={isRefreshing}
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded border p-4 bg-white/50">
          <div className="flex items-center gap-2 mb-3">
            <BoltIcon className="h-5 w-5 text-yellow-600" />
            <h2 className="font-medium">Overview</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-gray-500">Uptime</dt>
            <dd>{secondsToHms(data.uptime)}</dd>
            <dt className="text-gray-500">Version</dt>
            <dd className="font-mono">{data.version || 'unknown'}</dd>
            <dt className="text-gray-500">Commit</dt>
            <dd className="font-mono truncate" title={data.commitSha || ''}>{data.commitSha || '—'}</dd>
          </dl>
        </div>

        <div className="rounded border p-4 bg-white/50">
          <div className="flex items-center gap-2 mb-3">
            <ServerIcon className="h-5 w-5 text-blue-600" />
            <h2 className="font-medium">Runtime</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-gray-500">Node</dt>
            <dd className="font-mono">{data.nodeVersion}</dd>
            <dt className="text-gray-500">Env</dt>
            <dd>{data.environment}</dd>
            <dt className="text-gray-500">Platform</dt>
            <dd>{data.platform} {data.arch}</dd>
            <dt className="text-gray-500">Hostname</dt>
            <dd className="font-mono">{data.hostname}</dd>
            <dt className="text-gray-500">PID / PPID</dt>
            <dd className="font-mono">{data.pid}/{data.ppid}</dd>
          </dl>
        </div>

        <div className="rounded border p-4 bg-white/50">
          <div className="flex items-center gap-2 mb-3">
            <CircleStackIcon className="h-5 w-5 text-emerald-600" />
            <h2 className="font-medium">Database</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-gray-500">Connected</dt>
            <dd>
              <span className={(data.database?.connected ? 'text-emerald-700' : 'text-red-700') + ' inline-flex items-center gap-1'}>
                <span className={(data.database?.connected ? 'bg-emerald-500' : 'bg-red-500') + ' inline-block h-2 w-2 rounded-full'} />
                {data.database?.connected ? 'Yes' : 'No'}
              </span>
            </dd>
            <dt className="text-gray-500">Latency</dt>
            <dd>{data.database?.latencyMs != null ? `${data.database.latencyMs} ms` : '—'}</dd>
            {data.database?.error ? (
              <>
                <dt className="text-gray-500">Error</dt>
                <dd className="text-red-700">{data.database.error}</dd>
              </>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="rounded border p-4 bg-white/50">
        <div className="flex items-center gap-2 mb-3">
          <CpuChipIcon className="h-5 w-5 text-purple-600" />
          <h2 className="font-medium">Memory</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          <div><span className="text-gray-500">RSS:</span> <span className="font-mono">{formatBytes(data.memory?.rss)}</span></div>
          <div><span className="text-gray-500">Heap total:</span> <span className="font-mono">{formatBytes(data.memory?.heapTotal)}</span></div>
          <div><span className="text-gray-500">Heap used:</span> <span className="font-mono">{formatBytes(data.memory?.heapUsed)}</span></div>
          <div><span className="text-gray-500">External:</span> <span className="font-mono">{formatBytes(data.memory?.external)}</span></div>
          <div><span className="text-gray-500">Array buffers:</span> <span className="font-mono">{formatBytes(data.memory?.arrayBuffers ?? undefined)}</span></div>
        </div>
      </div>

      <div className="rounded border bg-white/50">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
          onClick={() => setShowRaw(v => !v)}
        >
          <span className="text-sm font-medium">Raw JSON</span>
          {showRaw ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </button>
        {showRaw ? (
          <pre className="px-4 pb-4 text-xs overflow-x-auto">
{JSON.stringify(data, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}


