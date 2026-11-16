import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from './services/api';
import { refreshSession, logoutUser } from './features/auth/authSlice';
import AuthForms from './features/auth/AuthForms';
import TaskList from './features/tasks/TaskList';

export default function App() {
  const [healthStatus, setHealthStatus] = useState({ loading: true, data: null, error: null });
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Attempt automatic session restore
    dispatch(refreshSession());

    // Check backend health
    api.get('/health')
      .then((res) => {
        setHealthStatus({ loading: false, data: res.data, error: null });
      })
      .catch((err) => {
        setHealthStatus({ loading: false, data: null, error: err.message });
      });
  }, [dispatch]);

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full py-4 flex items-center justify-between border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">LIFEHUB</h1>
          <p className="text-xs sm:text-sm text-slate-500">Personal Workspace & Life Organization</p>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
              Sprint 3 Active
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        {authLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
            <p className="mt-3 text-xs text-slate-500">Initializing LifeHub session...</p>
          </div>
        ) : isAuthenticated && user ? (
          <div className="space-y-6">
            {/* Top Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Workspace Dashboard</h2>
                <p className="text-xs text-slate-500">
                  Welcome back, <strong className="text-slate-700">{user.name}</strong>. Here is your daily productivity agenda.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Private Session Active
                </span>
              </div>
            </div>

            {/* Task Management System */}
            <TaskList />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
                Milestone 1: Tasks & Workspaces
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Your personal workspace, organized and private.
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Keep your tasks, upcoming schedule, expenses, and notes in one unified system.
                Private by default, fast, and protected by strict authorization boundaries.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">✓</span>
                  <span>Full Task lifecycle (Create, Edit, Prioritize, Complete, Delete)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">✓</span>
                  <span>Guaranteed data isolation (User B cannot access User A resources)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">✓</span>
                  <span>Automated test coverage on all endpoints</span>
                </div>
              </div>
            </div>

            <div>
              <AuthForms />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-200 gap-2">
        <span>LIFEHUB &bull; Sprint 3 Complete &bull; React, Express, PostgreSQL, Prisma</span>
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${healthStatus.data ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span>API: {healthStatus.data?.status || 'Connecting...'}</span>
        </span>
      </footer>
    </div>
  );
}
