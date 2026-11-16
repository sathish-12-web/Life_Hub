import { useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const CHART_COLORS = [
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
];

export default function CategoryBreakdownChart() {
  const { summary } = useSelector((state) => state.expenses);
  const categories = summary?.categoryBreakdown || [];

  // Filter categories to expense type first (or display all if needed)
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  if (expenseCategories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Category Spending Distribution
        </h4>
        <p className="text-xs text-slate-400 py-6">
          No expense transactions recorded for {summary?.month || 'this month'}.
        </p>
      </div>
    );
  }

  const chartData = expenseCategories.map((c) => ({
    name: c.category,
    amount: c.total,
    count: c.count,
  }));

  const totalExpenseSum = expenseCategories.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Category Spending Distribution
          </h4>
          <p className="text-xs text-slate-400">Aggregate expense breakdown for {summary?.month}</p>
        </div>
        <span className="text-xs font-bold text-slate-700">
          Total: ${totalExpenseSum.toFixed(2)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-3 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Spent']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Category List */}
        <div className="lg:col-span-2 space-y-2 max-h-52 overflow-y-auto pr-1">
          {expenseCategories.map((cat, idx) => {
            const percent = totalExpenseSum > 0 ? ((cat.total / totalExpenseSum) * 100).toFixed(1) : 0;
            return (
              <div
                key={cat.category}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="font-medium text-slate-850 truncate">{cat.category}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-800">${cat.total.toFixed(2)}</span>
                  <span className="ml-1.5 text-[10px] text-slate-400">({percent}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
