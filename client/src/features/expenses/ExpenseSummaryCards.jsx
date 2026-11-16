import { useDispatch, useSelector } from 'react-redux';
import { fetchSummary, setSelectedMonth } from './expensesSlice';

export default function ExpenseSummaryCards() {
  const dispatch = useDispatch();
  const { summary, selectedMonth, summaryLoading } = useSelector((state) => state.expenses);

  function handleMonthChange(e) {
    const newMonth = e.target.value;
    dispatch(setSelectedMonth(newMonth));
    dispatch(fetchSummary(newMonth));
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const isNetPositive = (summary?.netBalance ?? 0) >= 0;

  return (
    <div className="space-y-4">
      {/* Month Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Monthly Financial Overview</h3>
          <p className="text-xs text-slate-500">Database SQL-aggregated figures for selected period</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="summary-month" className="text-xs font-medium text-slate-600">
            Period:
          </label>
          <input
            id="summary-month"
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Income</span>
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
              ↓
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">
              {summaryLoading ? '...' : formatCurrency(summary.totalIncome)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Earnings & deposits</p>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expenses</span>
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-rose-100 text-rose-700 text-sm font-bold">
              ↑
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600">
              {summaryLoading ? '...' : formatCurrency(summary.totalExpense)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Spending & payouts</p>
        </div>

        {/* Net Savings Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Balance</span>
            <span
              className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold ${
                isNetPositive ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isNetPositive ? '✓' : '!'}
            </span>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold ${isNetPositive ? 'text-indigo-600' : 'text-rose-600'}`}>
              {summaryLoading ? '...' : formatCurrency(summary.netBalance)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {isNetPositive ? 'Positive net savings' : 'Expenses exceed income'}
          </p>
        </div>
      </div>
    </div>
  );
}
