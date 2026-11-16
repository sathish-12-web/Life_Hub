import { useState, useEffect } from 'react';
import { api } from './services/api';

export default function App() {
  const [healthStatus, setHealthStatus] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        setHealthStatus({ loading: false, data: res.data, error: null });
      })
      .catch((err) => {
        setHealthStatus({ loading: false, data: null, error: err.message });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6">
      <header className="max-w-4xl mx-auto w-full py-6 flex items-center justify-between border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">LIFEHUB</h1>
          <p className="text-sm text-slate-500">Personal Workspace & Life Organization</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Sprint 1 Active
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full my-auto py-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">System Diagnostics</h2>
          <p className="text-slate-600 text-sm mb-6">
            Connecting frontend shell, Express backend API, and PostgreSQL database.
          </p>

          <div className="rounded-lg border p-4 bg-slate-50">
            {healthStatus.loading && (
              <div className="flex items-center gap-3 text-slate-600">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]" />
                <span>Checking backend health at /api/health...</span>
              </div>
            )}

            {!healthStatus.loading && healthStatus.error && (
              <div className="text-rose-600 flex flex-col gap-1">
                <span className="font-medium">Backend connection issue</span>
                <span className="text-xs text-rose-500">{healthStatus.error}</span>
              </div>
            )}

            {!healthStatus.loading && healthStatus.data && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-emerald-800 text-sm">
                    Backend Status: {healthStatus.data.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Database: <strong className="text-slate-800">{healthStatus.data.database}</strong>
                </div>
                <div className="text-xs text-slate-400">
                  Server Time: {healthStatus.data.timestamp}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        LIFEHUB &bull; Sprint 1 Foundation &bull; React, Node.js, PostgreSQL, Prisma
      </footer>
    </div>
  );
}
