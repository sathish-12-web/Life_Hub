import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTransactions,
  fetchSummary,
  deleteTransaction,
  clearExpensesError,
} from './expensesSlice';
import ExpenseSummaryCards from './ExpenseSummaryCards';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import TransactionItem from './TransactionItem';
import TransactionModal from './TransactionModal';

export default function ExpensesView() {
  const dispatch = useDispatch();
  const { items, meta, loading, error, selectedMonth } = useSelector((state) => state.expenses);

  const [typeFilter, setTypeFilter] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Load summary and transactions on mount or filter change
  useEffect(() => {
    dispatch(fetchSummary(selectedMonth));
  }, [dispatch, selectedMonth]);

  useEffect(() => {
    dispatch(
      fetchTransactions({
        page: currentPage,
        limit: 15,
        type: typeFilter || undefined,
        category: categorySearch.trim() || undefined,
        sort: 'occurredAt',
        order: 'desc',
      })
    );
  }, [dispatch, currentPage, typeFilter, categorySearch]);

  function handleOpenCreate() {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(tx) {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await dispatch(deleteTransaction(id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Expenses & Financial Reports
          </h2>
          <p className="text-xs text-slate-500">
            Track income, categorize expenses, and review automated monthly database analytics.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
        >
          <span className="text-sm font-bold">+</span>
          <span>Log Transaction</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => dispatch(clearExpensesError())}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <ExpenseSummaryCards />

      {/* Category Spending Chart */}
      <CategoryBreakdownChart />

      {/* Transaction List Section */}
      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('');
                  setCurrentPage(1);
                }}
                className={`py-1 px-2.5 text-xs font-medium rounded-md transition-all ${
                  typeFilter === '' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('EXPENSE');
                  setCurrentPage(1);
                }}
                className={`py-1 px-2.5 text-xs font-medium rounded-md transition-all ${
                  typeFilter === 'EXPENSE' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Expenses
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('INCOME');
                  setCurrentPage(1);
                }}
                className={`py-1 px-2.5 text-xs font-medium rounded-md transition-all ${
                  typeFilter === 'INCOME' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by category..."
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-48 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Transactions List with Loading, Empty & Error states */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent" />
            <p className="mt-2 text-xs text-slate-500">Loading financial records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold mb-2">
              $
            </div>
            <h4 className="text-sm font-semibold text-slate-700">No transactions found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {categorySearch || typeFilter
                ? 'No transactions match the selected filters. Try resetting the filter.'
                : 'Log your first income or expense transaction to see automated reports.'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              + Log First Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-semibold text-slate-700">{meta.page}</span> of{' '}
              <span className="font-semibold text-slate-700">{meta.totalPages}</span> ({meta.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= meta.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
}
