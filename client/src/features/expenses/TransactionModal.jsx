import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createTransaction, updateTransaction } from './expensesSlice';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gift', 'Refund', 'Other Income'];
const EXPENSE_CATEGORIES = [
  'Groceries',
  'Dining',
  'Rent & Housing',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Health & Fitness',
  'Shopping',
  'Travel',
  'Education',
  'Other Expense',
];

export default function TransactionModal({ isOpen, onClose, transactionToEdit }) {
  const dispatch = useDispatch();

  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'EXPENSE');
      setAmount(transactionToEdit.amount ? String(transactionToEdit.amount) : '');
      setCurrency(transactionToEdit.currency || 'USD');
      setCategory(transactionToEdit.category || '');
      setNote(transactionToEdit.note || '');

      if (transactionToEdit.occurredAt) {
        const d = new Date(transactionToEdit.occurredAt);
        // Format to YYYY-MM-DDTHH:mm for datetime-local
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setOccurredAt(formatted);
      } else {
        setOccurredAt('');
      }
    } else {
      setType('EXPENSE');
      setAmount('');
      setCurrency('USD');
      setCategory('Groceries');
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setOccurredAt(formatted);
      setNote('');
    }
    setError('');
  }, [transactionToEdit, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number greater than 0');
      return;
    }

    if (!category.trim()) {
      setError('Category is required');
      return;
    }

    setSubmitting(true);

    const payload = {
      type,
      amount: parsedAmount,
      currency,
      category: category.trim(),
      occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
      note: note.trim() || null,
    };

    try {
      if (transactionToEdit) {
        await dispatch(updateTransaction({ id: transactionToEdit.id, ...payload })).unwrap();
      } else {
        await dispatch(createTransaction(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setError(err || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  }

  const categoryPresets = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">
            {transactionToEdit ? 'Edit Transaction' : 'Log New Transaction'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 leading-none"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type Toggle: Income vs Expense */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('EXPENSE');
                  if (!transactionToEdit) setCategory('Groceries');
                }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === 'EXPENSE'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('INCOME');
                  if (!transactionToEdit) setCategory('Salary');
                }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === 'INCOME'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Income (Inflow)
              </button>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ($) *
              </label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label htmlFor="tx-currency" className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <input
                id="tx-currency"
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>
          </div>

          {/* Category Input & Quick Presets */}
          <div>
            <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <input
              id="tx-category"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Groceries, Rent, Salary..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {categoryPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setCategory(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                    category === preset
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label htmlFor="tx-occurredAt" className="block text-xs font-semibold text-slate-700 mb-1">
              Date & Time
            </label>
            <input
              id="tx-occurredAt"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="tx-note" className="block text-xs font-semibold text-slate-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              id="tx-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add extra details, merchant, or notes..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
