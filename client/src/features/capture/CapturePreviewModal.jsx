import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closePreview, confirmCapture } from './captureSlice';

export default function CapturePreviewModal() {
  const dispatch = useDispatch();
  const { previewData, isPreviewOpen, loading, error } = useSelector((state) => state.capture);

  const [activeType, setActiveType] = useState('NOTE');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (previewData) {
      setActiveType(previewData.detectedType || 'NOTE');
      setFormData(previewData.data ? { ...previewData.data } : {});
    }
  }, [previewData]);

  if (!isPreviewOpen || !previewData) return null;

  function handleFieldChange(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleConfirm(e) {
    e.preventDefault();
    await dispatch(confirmCapture({ type: activeType, data: formData }));
  }

  function handleTypeSwitch(newType) {
    setActiveType(newType);
    // Initialize sensible defaults for the switched type if needed
    if (newType === 'TASK' && !formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: prev.note || prev.body || 'Captured Task',
        priority: 'MEDIUM',
      }));
    } else if (newType === 'EVENT' && !formData.startAt) {
      const start = new Date();
      start.setHours(start.getHours() + 1, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      setFormData((prev) => ({
        ...prev,
        title: prev.title || prev.note || 'Captured Event',
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      }));
    } else if (newType === 'TRANSACTION' && !formData.amount) {
      setFormData((prev) => ({
        ...prev,
        type: 'EXPENSE',
        amount: 10.0,
        currency: 'USD',
        category: 'General',
        occurredAt: new Date().toISOString(),
      }));
    } else if (newType === 'NOTE' && !formData.body) {
      setFormData((prev) => ({
        ...prev,
        title: prev.title || 'Quick Note',
        body: prev.note || '',
      }));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">Quick Capture Preview</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                Rule-based
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and edit before saving to your workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closePreview())}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 leading-none"
          >
            &times;
          </button>
        </div>

        {/* Original Input Text Box */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Raw Input:
          </p>
          <p className="text-xs text-slate-700 italic">"{previewData.raw}"</p>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleConfirm} className="mt-4 space-y-4">
          {/* Destination Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm Item Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['TASK', 'EVENT', 'TRANSACTION', 'NOTE'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => handleTypeSwitch(t)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    activeType === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Type-Specific Editable Fields */}
          {activeType === 'TASK' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-850 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority || 'MEDIUM'}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-850 bg-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      formData.dueAt
                        ? new Date(formData.dueAt).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        'dueAt',
                        e.target.value ? new Date(e.target.value).toISOString() : null
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-850 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeType === 'EVENT' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-850 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      formData.startAt
                        ? new Date(formData.startAt).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        'startAt',
                        e.target.value ? new Date(e.target.value).toISOString() : ''
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-850 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      formData.endAt ? new Date(formData.endAt).toISOString().slice(0, 16) : ''
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        'endAt',
                        e.target.value ? new Date(e.target.value).toISOString() : ''
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-850 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeType === 'TRANSACTION' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Flow Type
                  </label>
                  <select
                    value={formData.type || 'EXPENSE'}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-850 bg-white"
                  >
                    <option value="EXPENSE">Expense (Outflow)</option>
                    <option value="INCOME">Income (Inflow)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount || ''}
                    onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-850 bg-white font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-850 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      formData.occurredAt
                        ? new Date(formData.occurredAt).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        'occurredAt',
                        e.target.value ? new Date(e.target.value).toISOString() : ''
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-850 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeType === 'NOTE' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-850 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Note Body
                </label>
                <textarea
                  rows={4}
                  value={formData.body || ''}
                  onChange={(e) => handleFieldChange('body', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-850 bg-white"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => dispatch(closePreview())}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : `Confirm & Save to ${activeType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
