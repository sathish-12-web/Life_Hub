import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createEvent, updateEvent } from './plannerSlice';

export default function EventModal({ isOpen, onClose, initialData = null }) {
  const isEditing = Boolean(initialData);

  // Default to today/now + 1 hour
  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 1);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startAt: initialData?.startAt
      ? new Date(initialData.startAt).toISOString().slice(0, 16)
      : defaultStart.toISOString().slice(0, 16),
    endAt: initialData?.endAt
      ? new Date(initialData.endAt).toISOString().slice(0, 16)
      : defaultEnd.toISOString().slice(0, 16),
    recurrenceRule: initialData?.recurrenceRule || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  if (!isOpen) return null;

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Event title is required.');
      return;
    }

    if (new Date(formData.endAt) < new Date(formData.startAt)) {
      setError('End date/time must be after or equal to Start date/time.');
      return;
    }

    setSaving(true);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      startAt: new Date(formData.startAt).toISOString(),
      endAt: new Date(formData.endAt).toISOString(),
      recurrenceRule: formData.recurrenceRule || null,
    };

    try {
      if (isEditing) {
        await dispatch(updateEvent({ id: initialData.id, ...payload })).unwrap();
      } else {
        await dispatch(createEvent(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setError(err || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Schedule Event' : 'Add Calendar Event'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Design review with engineering"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Agenda, location, or video call links..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="startAt" className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date & Time *
              </label>
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                required
                value={formData.startAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="endAt" className="block text-xs font-semibold text-slate-700 mb-1">
                End Date & Time *
              </label>
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                required
                value={formData.endAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="recurrenceRule" className="block text-xs font-semibold text-slate-700 mb-1">
              Recurrence
            </label>
            <select
              id="recurrenceRule"
              name="recurrenceRule"
              value={formData.recurrenceRule}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Does not repeat</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
