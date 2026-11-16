import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from './services/api';
import { refreshSession, logoutUser } from './features/auth/authSlice';
import AuthForms from './features/auth/AuthForms';

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
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
              Sprint 2 Active
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome, {user.name}! 👋</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    You are securely authenticated. Your personal workspace is ready for Sprint 3 (Tasks CRUD).
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Authenticated
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Account ID</p>
                  <p className="text-sm font-mono text-slate-800 truncate text-[11px]">{user.id}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Timezone</p>
                  <p className="text-sm font-medium text-slate-800">{user.timezone || 'UTC'}</p>
                </div>
              </div>
            </div>

            {/* Diagnostics Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Backend Connection Status</h3>
              {healthStatus.loading ? (
                <p className="text-xs text-slate-500">Connecting to API...</p>
              ) : healthStatus.error ? (
                <p className="text-xs text-rose-500">API error: {healthStatus.error}</p>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>API Status: <strong>{healthStatus.data?.status}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Database: <strong>{healthStatus.data?.database}</strong></span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
                Sprint 2: Authentication
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Your life organized in one secure place.
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                LifeHub keeps your tasks, events, expenses, and notes structured and private by default.
                No data selling, no vendor lock-in, and strict user isolation.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">✓</span>
                  <span>Password hashing with bcrypt</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">✓</span>
                  <span>Short-lived JWT access tokens + httpOnly refresh cookies</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">✓</span>
                  <span>Rate limiting and Zod request validation</span>
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
      <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        LIFEHUB &bull; Sprint 2 Complete &bull; React, Node.js, Express, PostgreSQL, Prisma
      </footer>
    </div>
  );
}
