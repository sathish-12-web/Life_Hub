import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearAuthError } from './authSlice';

export default function AuthForms() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [clientError, setClientError] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  function handleSwitchMode(newMode) {
    setMode(newMode);
    setClientError('');
    dispatch(clearAuthError());
  }

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (clientError) setClientError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setClientError('');

    if (!formData.email || !formData.password) {
      setClientError('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!formData.name.trim()) {
        setClientError('Name is required.');
        return;
      }
      if (formData.password.length < 8) {
        setClientError('Password must be at least 8 characters.');
        return;
      }
      dispatch(registerUser(formData));
    } else {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      {/* Tab Switcher */}
      <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => handleSwitchMode('login')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode('register')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'register'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {mode === 'login' ? 'Welcome back to LifeHub' : 'Get started with LifeHub'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'login'
            ? 'Access your tasks, planner, expenses, and notes in one place.'
            : 'Organize your everyday work and personal life effortlessly.'}
        </p>
      </div>

      {(error || clientError) && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {clientError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={formData.password}
            onChange={handleChange}
            placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
              <span>Processing...</span>
            </span>
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
