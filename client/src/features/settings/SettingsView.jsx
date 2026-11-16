import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, logoutUser } from '../auth/authSlice';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
];

export default function SettingsView() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTimezone(user.timezone || 'UTC');
    }
  }, [user]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateUserProfile({
          name: name.trim(),
          timezone: timezone.trim(),
        })
      ).unwrap();
      setSuccessMsg('Profile settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err || 'Failed to update profile settings');
    } finally {
      setSaving(false);
    }
  }

  const formattedJoinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Account & Workspace Settings
        </h2>
        <p className="text-xs text-slate-500">
          Manage your personal profile, timezone, and review security isolation status.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          ! {errorMsg}
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Profile Details</h3>
        <p className="text-xs text-slate-500 mb-5">
          Your profile display name and active workspace timezone.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name *
              </label>
              <input
                id="settings-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label htmlFor="settings-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="settings-email"
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">Unique account email identifier</p>
            </div>
          </div>

          <div>
            <label htmlFor="settings-timezone" className="block text-xs font-semibold text-slate-700 mb-1">
              Workspace Timezone
            </label>
            <select
              id="settings-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Used for formatting calendar reminders and task due dates
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & System Posture Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Security & System Guarantees</h3>
        <p className="text-xs text-slate-500 mb-4">
          Architectural security properties enforced on this workspace.
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-emerald-600 font-bold text-sm">🔒</span>
            <div>
              <p className="text-xs font-semibold text-slate-800">Strict Multi-Tenant Isolation</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All personal queries filter strictly by your verified JWT owner ID in PostgreSQL.
                Requests attempting to access unauthorized records return 404 (Not Found) to prevent ID leakage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-indigo-600 font-bold text-sm">🔑</span>
            <div>
              <p className="text-xs font-semibold text-slate-800">Dual-Token Authentication</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Short-lived 15-minute access tokens stored in memory + 7-day secure httpOnly refresh cookies.
                Passwords hashed using bcrypt with salt rounds of 10.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-amber-600 font-bold text-sm">⚡</span>
            <div>
              <p className="text-xs font-semibold text-slate-800">Database SQL Aggregation</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Financial summaries and metrics are computed directly by PostgreSQL aggregates,
                guaranteeing deterministic mathematical accuracy and preventing client-side looping.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Member Since: {formattedJoinedDate}</span>
          <span className="font-mono text-[10px] text-slate-400">ID: {user?.id}</span>
        </div>
      </div>

      {/* Session Controls / Sign Out Card */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-rose-800 mb-1">Session Management</h3>
        <p className="text-xs text-slate-500 mb-4">
          End your active session and invalidate your refresh cookie on this browser.
        </p>

        <button
          type="button"
          onClick={() => dispatch(logoutUser())}
          className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
        >
          Sign Out of LIFEHUB
        </button>
      </div>
    </div>
  );
}
